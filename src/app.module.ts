import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_PATH ?? 'data/app.db',
      autoLoadEntities: true,
      synchronize: false,
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
    }),
    ProjectsModule
  ],
})
export class AppModule { }