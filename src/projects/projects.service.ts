import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { User } from '../users/entities/user.entity';
import { ProjectMember } from './entities/project-members.entity';

@Injectable()
export class ProjectsService {
    constructor(
        private readonly datasource: DataSource,
        @InjectRepository(Project) private readonly projectsRepo: Repository<Project>,
        @InjectRepository(ProjectMember) private readonly projectMembersRepo: Repository<ProjectMember>,
        @InjectRepository(User) private readonly usersRepo: Repository<User>,
    ) { }

    async getMembers(projectId: number) {
        const project = await this.projectsRepo.findOne({ where: { id: projectId } });
        if (!project) throw new NotFoundException('Project not found');

        const rows = await this.datasource.query(
            `WITH RECURSIVE
            tree(member_type, member_id, depth, group_path, visited_groups) AS (
            -- 0) membres directs du projet
            SELECT
                pm.member_type,
                pm.member_id,
                0 AS depth,
                '' AS group_path,
                '' AS visited_groups
            FROM projects_members_v2 pm
            WHERE pm.project_id = ?

            UNION ALL

            -- 1) si on rencontre un group, on descend dans ses membres
            SELECT
                gm.member_type,
                gm.member_id,
                t.depth + 1,
                CASE
                WHEN t.group_path = '' THEN g.name
                ELSE t.group_path || '>' || g.name
                END AS group_path,
                t.visited_groups || ',' || CAST(g.id AS TEXT) || ',' AS visited_groups
            FROM tree t
            JOIN groups g
                ON t.member_type = 'group' AND g.id = t.member_id
            JOIN group_members gm
                ON gm.group_id = g.id
            WHERE
                t.depth < 5
                -- anti-cycle: ne pas revisiter un group déjà dans la chaîne
                AND instr(t.visited_groups, ',' || CAST(g.id AS TEXT) || ',') = 0
            )
            SELECT
            u.id AS id,
            (u.first_name || ' ' || u.last_name) AS name,
            COALESCE(MIN(NULLIF(tree.group_path, '')), '') AS group_path
            FROM tree
            JOIN users u
            ON tree.member_type = 'user'
            AND u.id = tree.member_id
            GROUP BY u.id
            ORDER BY u.id;`,
            [projectId],
        );

        return rows.map((r: any) => ({
            id: r.id,
            name: r.name,
            groups: r.group_path ? String(r.group_path).split('>') : [],
        }));
    }

    async addMembers(projectId: number, userIds: number[]) {
        if (!Array.isArray(userIds) || userIds.length === 0) {
            throw new BadRequestException('user_ids must be a non-empty array');
        }

        const project = await this.projectsRepo.findOne({ where: { id: projectId } });
        if (!project) throw new NotFoundException('Project not found');

        const users = await this.usersRepo.find({ where: { id: In(userIds) } });
        const foundIds = new Set(users.map(user => user.id));
        const missing = userIds.filter(id => !foundIds.has(id));
        if (missing.length) {
            throw new NotFoundException(`User(s) not found: ${missing.join(', ')}`);
        }

        return this.datasource.transaction(async (manager) => {
            const projectMember = manager.getRepository(ProjectMember);

            const existing = await projectMember.find({
                where: userIds.map(userId => ({ projectId, userId })),
            });
            const existingIds = new Set(existing.map(e => e.userId));

            if (userIds.length === 1 && existingIds.has(userIds[0])) {
                throw new ConflictException(`User ${userIds[0]} is already a member`);
            }

            const usersToInsert = userIds.filter(id => !existingIds.has(id));

            if (usersToInsert.length > 0) {
                await projectMember.insert(
                    usersToInsert.map(userId => ({ projectId, userId })),
                );
            }

            return users
                .filter(user => usersToInsert.includes(user.id))
                .map(user => ({
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`,
                }));
        });
    }

    async removeMember(projectId: number, userId: number) {
        const project = await this.projectsRepo.findOne({ where: { id: projectId } });
        if (!project) throw new NotFoundException('Project not found');

        const res = await this.projectMembersRepo.delete({ projectId, userId });
        if (res.affected === 0) throw new NotFoundException('Membership not found');
    }
}
