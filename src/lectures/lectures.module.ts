import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { Lecture } from './entities/lecture.entity';
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
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
    UsersModule,
  ],
  controllers: [LecturesController],
  providers: [LecturesService],
})
export class LecturesModule {}
