import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'projects' })
export class Project {
    @PrimaryGeneratedColumn({ type: 'integer' }) id: number;
    @Column({ type: 'text' }) name: string;
}