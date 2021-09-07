import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { LecturesModule } from './lectures/lectures.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Lecture } from './lectures/entities/lecture.entity';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { StudentLecture } from './lectures/entities/studentLecture.entity';
import { LectureTag } from './lectures/entities/lectureTag.entity';
import { Question } from './lectures/entities/question.entity';
import { Tag } from './lectures/entities/tag.entity';
import { Video } from './lectures/entities/video.entity';
import { LectureReview } from './lectures/entities/lectureReview.entity';
import { Resource } from './resources/entities/resource.entity';
import { ResourcesModule } from './resources/resources.module';
import { LectureNotice } from './lectures/entities/lectureNotice.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.NODE_ENV === 'production'
        ? {
            url: process.env.DATABASE_URL,
            extra: { ssl: { rejectUnauthorized: false } },
          }
        : {
            host: process.env.DATABASE_HOST,
            port: +process.env.DATABASE_PORT,
            username: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_DATABASE,
          }),
      entities: [
        User,
        Lecture,
        LectureTag,
        LectureNotice,
        Question,
        StudentLecture,
        Tag,
        Video,
        LectureReview,
        Resource,
      ],
      synchronize: true,
      logging: true,
    }),
    UsersModule,
    LecturesModule,
    AuthModule,
    ResourcesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
