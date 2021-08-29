import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Lecture } from './entities/lecture.entity';
import { LectureReview } from './entities/lectureReview.entity';
import { LectureTag } from './entities/lectureTag.entity';
import { Notice } from './entities/notice.entity';
import { Question } from './entities/question.entity';
import { StudentLecture } from './entities/studentLecture.entity';
import { Tag } from './entities/tag.entity';
import { Video } from './entities/video.entity';
import { LecturesController } from './lectures.controller';
import { LecturesService } from './lectures.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lecture,
      LectureTag,
      Notice,
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
