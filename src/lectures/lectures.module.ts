import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entity/user.entity';
import { Lecture } from './entity/lecture.entity';
import { LectureNotice } from './entity/lectureNotice.entity';
import { LectureReview } from './entity/lectureReview.entity';
import { LectureTag } from './entity/lectureTag.entity';
import { Question } from './entity/question.entity';
import { StudentLecture } from './entity/studentLecture.entity';
import { Tag } from './entity/tag.entity';
import { Video } from './entity/video.entity';
import { LecturesController } from './lectures.controller';
import { LecturesService } from './lectures.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lecture,
      LectureTag,
      LectureNotice,
      Question,
      StudentLecture,
      Tag,
      Video,
      User,
      LectureReview,
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [LecturesController],
  providers: [LecturesService],
})
export class LecturesModule {}
