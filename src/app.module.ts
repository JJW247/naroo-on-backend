import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { LecturesModule } from './lectures/lectures.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entity/user.entity';
import { Lecture } from './lectures/entity/lecture.entity';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { StudentLecture } from './lectures/entity/studentLecture.entity';
import { LectureTag } from './lectures/entity/lectureTag.entity';
import { Question } from './lectures/entity/question.entity';
import { Tag } from './lectures/entity/tag.entity';
import { Video } from './lectures/entity/video.entity';
import { LectureReview } from './lectures/entity/lectureReview.entity';
import { Resource } from './resources/entity/resource.entity';
import { ResourcesModule } from './resources/resources.module';
import { LectureNotice } from './lectures/entity/lectureNotice.entity';

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
      // entities: [
      //   User,
      //   Lecture,
      //   LectureTag,
      //   LectureNotice,
      //   Question,
      //   StudentLecture,
      //   Tag,
      //   Video,
      //   LectureReview,
      //   Resource,
      // ],
      autoLoadEntities: true,
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
