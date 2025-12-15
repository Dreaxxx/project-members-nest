import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_PATH ?? 'projects.db',
      autoLoadEntities: true,
      synchronize: false,
    }),
  ],
})
export class AppModule { }