import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe, HttpCode } from '@nestjs/common';
import { ApiTags, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { AddMembersDto } from './dto/add-members.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
    constructor(private readonly service: ProjectsService) { }

    @Get(':id/members')
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'List of project members' })
    @ApiResponse({ status: 404, description: 'Project not found' })
    async getMembers(@Param('id', ParseIntPipe) id: number) {
        return this.service.getMembers(id);
    }

    @Post(':id/members')
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: AddMembersDto })
    @ApiResponse({
        status: 201,
        description: 'Member(s) successfully added',
        schema: {
            example: [
                { id: 3, name: 'Alice Johnson' }
            ],
        },
    })
    @ApiResponse({
        status: 409,
        description: 'User already member (only when a single user is provided)',
    })
    @ApiResponse({
        status: 404,
        description: 'Project or user not found',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid payload',
    })
    async addMembers(@Param('id', ParseIntPipe) id: number, @Body() dto: AddMembersDto) {
        return this.service.addMembers(id, dto.user_ids);
    }

    @Delete(':projectId/members/:userId')
    @ApiParam({ name: 'projectId', type: Number })
    @ApiParam({ name: 'userId', type: Number })
    @HttpCode(204)
    @ApiResponse({
        status: 404,
        description: 'Project or user not found',
    })
    async remove(
        @Param('projectId', ParseIntPipe) projectId: number,
        @Param('userId', ParseIntPipe) userId: number,
    ) {
        await this.service.removeMember(projectId, userId);
    }
}