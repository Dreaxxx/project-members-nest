import { MigrationInterface, QueryRunner } from "typeorm";

export class ExerciseBGroupsAndProjectMembers1765885151535 implements MigrationInterface {
    name = 'ExerciseBGroupsAndProjectMembers1765885151535';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );
    `);

        await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS group_members (
        group_id INTEGER NOT NULL,
        member_type TEXT NOT NULL CHECK (member_type IN ('user','group')),
        member_id INTEGER NOT NULL,
        PRIMARY KEY (group_id, member_type, member_id),
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
      );
    `);

        await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS projects_members_v2 (
        project_id INTEGER NOT NULL,
        member_type TEXT NOT NULL CHECK (member_type IN ('user','group')),
        member_id INTEGER NOT NULL,
        PRIMARY KEY (project_id, member_type, member_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
    `);

        await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_group_members_group
        ON group_members(group_id);
    `);

        await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_group_members_member
        ON group_members(member_type, member_id);
    `);

        await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_project_members_project
        ON projects_members_v2(project_id);
    `);

        await queryRunner.query(`
        INSERT OR IGNORE INTO projects_members_v2(project_id, member_type, member_id)
        SELECT project_id, 'user', user_id FROM projects_members;
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_project_members_project;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_group_members_member;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_group_members_group;`);

        await queryRunner.query(`DROP TABLE IF EXISTS projects_members_v2;`);
        await queryRunner.query(`DROP TABLE IF EXISTS group_members;`);
        await queryRunner.query(`DROP TABLE IF EXISTS groups;`);
    }
}
