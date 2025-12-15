import 'reflect-metadata';
import { DataSource } from 'typeorm';

export default new DataSource({
    type: 'sqlite',
    database: process.env.DB_PATH ?? 'data/app.db',
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/migrations/*.js'],
    migrationsTableName: 'migrations',
    migrationsRun: false,
    synchronize: false,
    logging: true,
});
