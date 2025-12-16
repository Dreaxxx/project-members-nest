import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { prepareTestDb } from './utils/db';

describe('Projects E2E (Exercise A)', () => {
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /projects/:id/members', () => {
    it('200 returns members list', async () => {
      const res = await request(app.getHttpServer())
        .get('/projects/1/members')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('name');
      }
    });

    it('404 if project does not exist', async () => {
      await request(app.getHttpServer())
        .get('/projects/999999/members')
        .expect(404);
    });

    it('400 if id is not int', async () => {
      await request(app.getHttpServer())
        .get('/projects/abc/members')
        .expect(400);
    });
  });

  describe('POST /projects/:id/members', () => {
    it('201 adds new member', async () => {
      const notMember = await datasource.query(`
        SELECT u.id
        FROM users u
        WHERE u.id NOT IN (SELECT user_id FROM projects_members WHERE project_id = 1)
        LIMIT 1;
      `);

      expect(notMember.length).toBe(1);
      const newUserId = notMember[0].id;

      const res = await request(app.getHttpServer())
        .post('/projects/1/members')
        .send({ user_ids: [newUserId] })
        .expect(201);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: newUserId })]),
      );

      const check = await datasource.query(
        `SELECT 1 FROM projects_members WHERE project_id = 1 AND user_id = ?`,
        [newUserId],
      );
      expect(check.length).toBe(1);
    });

    it('409 if single user already member', async () => {
      const existing = await datasource.query(`
        SELECT user_id AS id
        FROM projects_members
        WHERE project_id = 1
        LIMIT 1;
      `);
      expect(existing.length).toBe(1);

      await request(app.getHttpServer())
        .post('/projects/1/members')
        .send({ user_ids: [existing[0].id] })
        .expect(409);
    });

    it('201 if multiple users with already existing member and new member', async () => {
      const existing = await datasource.query(`
        SELECT user_id AS id
        FROM projects_members
        WHERE project_id = 1
        LIMIT 1;
      `);
      expect(existing.length).toBe(1);
      const existingId = existing[0].id;

      const notMember = await datasource.query(`
        SELECT u.id
        FROM users u
        WHERE u.id NOT IN (SELECT user_id FROM projects_members WHERE project_id = 1)
        LIMIT 1;
      `);
      expect(notMember.length).toBe(1);
      const newId = notMember[0].id;

      const res = await request(app.getHttpServer())
        .post('/projects/1/members')
        .send({ user_ids: [existingId, newId] })
        .expect(201);

      expect(res.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: newId })]),
      );
    });

    it('404 if user does not exist', async () => {
      await request(app.getHttpServer())
        .post('/projects/1/members')
        .send({ user_ids: [999999999] })
        .expect(404);
    });

    it('400 if payload invalid', async () => {
      await request(app.getHttpServer())
        .post('/projects/1/members')
        .send({ user_ids: [] })
        .expect(400);
    });
  });

  describe('DELETE /projects/:projectId/members/:userId', () => {
    it('204 removes membership', async () => {
      const newMember = await datasource.query(`
        SELECT u.id
        FROM users u
        WHERE u.id NOT IN (SELECT user_id FROM projects_members WHERE project_id = 1)
        LIMIT 1;
      `);
      const uid = newMember[0].id;

      await datasource.query(
        `INSERT OR IGNORE INTO projects_members(project_id, user_id) VALUES (1, ?)`,
        [uid],
      );

      await request(app.getHttpServer())
        .delete(`/projects/1/members/${uid}`)
        .expect(204);

      const check = await datasource.query(
        `SELECT 1 FROM projects_members WHERE project_id = 1 AND user_id = ?`,
        [uid],
      );
      expect(check.length).toBe(0);
    });

    it('404 if membership not found', async () => {
      const notMember = await datasource.query(`
        SELECT u.id
        FROM users u
        WHERE u.id NOT IN (SELECT user_id FROM projects_members WHERE project_id = 1)
        LIMIT 1;
      `);
      const uid = notMember[0].id;

      await request(app.getHttpServer())
        .delete(`/projects/1/members/${uid}`)
        .expect(404);
    });

    it('400 if params invalid', async () => {
      await request(app.getHttpServer())
        .delete('/projects/abc/members/def')
        .expect(400);
    });
  });
});
