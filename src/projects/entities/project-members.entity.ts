import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './project.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'projects_members' })
export class ProjectMember {
    @PrimaryColumn({ type: 'integer', name: 'project_id' }) projectId: number;
    @PrimaryColumn({ type: 'integer', name: 'user_id' }) userId: number;

    @ManyToOne(() => Project, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id' })
    project: Project;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}