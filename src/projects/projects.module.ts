import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-members.entity';
import { User } from '../users/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Project, ProjectMember, User])],
    controllers: [ProjectsController],
    providers: [ProjectsService],
})
export class ProjectsModule { }
