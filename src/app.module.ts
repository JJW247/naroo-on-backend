import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { LecturesModule } from './lectures/lectures.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './users/entities/users.entity';
import { Lectures } from './lectures/entities/lectures.entity';
import { ConfigModule } from '@nestjs/config';
import { Reviews } from './lectures/entities/reviews.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      entities: [Users, Lectures, Reviews],
      synchronize: true,
      logging: true,
    }),
    UsersModule,
    LecturesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
