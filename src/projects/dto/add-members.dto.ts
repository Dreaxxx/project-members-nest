import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt, ArrayUnique } from 'class-validator';
import { Type } from 'class-transformer';

export class AddMembersDto {
    @ApiProperty({ example: [1, 2, 3] })
    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    @Type(() => Number)
    @IsInt({ each: true })
    user_ids: number[];
}