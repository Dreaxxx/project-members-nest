import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn({ type: 'integer' }) id: number;

    @Column({ type: 'text', name: 'first_name' }) firstName: string;
    @Column({ type: 'text', name: 'last_name' }) lastName: string;
}