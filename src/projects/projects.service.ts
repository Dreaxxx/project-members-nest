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

        const rows = await this.projectMembersRepo
            .createQueryBuilder('project_members')
            .innerJoin('project_members.user', 'user')
            .where('project_members.project_id = :projectId', { projectId })
            .select(['user.id AS id', "user.first_name || ' ' || user.last_name AS name"])
            .orderBy('user.id', 'ASC')
            .getRawMany();

        return rows;
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
