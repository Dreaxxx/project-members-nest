import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { prepareTestDb } from './utils/db';
import { User } from 'src/users/entities/user.entity';

describe('Projects E2E (Exercice B)', () => {
    let app: INestApplication;
    let datasource: DataSource;

    beforeAll(async () => {
        prepareTestDb();

        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();

        datasource = app.get(DataSource);

        await datasource.query(`INSERT OR IGNORE INTO groups(name) VALUES ('A'),('B'),('C'),('D'),('E'),('F');`);

        const linkGroup = async (parent: string, child: string) => {
            await datasource.query(
                `
                INSERT OR IGNORE INTO group_members(group_id, member_type, member_id)
                SELECT parent.id, 'group', child.id
                FROM groups parent, groups child
                WHERE parent.name = ? AND child.name = ?;
        `,
                [parent, child],
            );
        };

        await linkGroup('A', 'B');
        await linkGroup('B', 'C');
        await linkGroup('C', 'D');
        await linkGroup('D', 'E');
        await linkGroup('E', 'F');

        // E -> user 10 (depth 5) : doit sortir
        await datasource.query(
            `
            INSERT OR IGNORE INTO group_members(group_id, member_type, member_id)
            SELECT g.id, 'user', 10 FROM groups g WHERE g.name='E';
      `,
        );

        // F -> user 9 (depth 6) : ne doit pas resortir car blocqué à depth 5
        await datasource.query(
            `
            INSERT OR IGNORE INTO group_members(group_id, member_type, member_id)
            SELECT g.id, 'user', 9 FROM groups g WHERE g.name='F';
      `,
        );

        await datasource.query(
            `
            INSERT OR IGNORE INTO projects_members_v2(project_id, member_type, member_id)
            SELECT 1, 'group', g.id FROM groups g WHERE g.name='A';
      `,
        );
    });

    afterAll(async () => {
        await app.close();
    });

    it('GET /projects/1/members returns depth-5 user but not depth-6 user', async () => {
        const res = await request(app.getHttpServer())
            .get('/projects/1/members')
            .expect(200);

        // user 10 doit avoir les groups A>B>C>D>E
        const user10 = res.body.find((user: User) => user.id === 10);
        expect(user10).toBeDefined();
        expect(user10.groups).toEqual(['A', 'B', 'C', 'D', 'E']);

        // user 9 ne doit pas être defined
        const user9 = res.body.find((user: User) => user.id === 9);
        expect(user9).toBeUndefined();
    });
});
