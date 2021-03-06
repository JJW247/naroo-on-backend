import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entity/user.entity';
import { Answer } from './entity/answer.entity';
import { LectureNotice } from './entity/lectureNotice.entity';
import { LectureTag } from './entity/lectureTag.entity';
import { Question } from './entity/question.entity';
import { StudentLecture } from './entity/studentLecture.entity';
import { Tag } from './entity/tag.entity';
import { LecturesController } from './lectures.controller';
import { LecturesService } from './lectures.service';
import { LecturesRepository } from './repository/lectures.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LecturesRepository,
      LectureTag,
      LectureNotice,
      Question,
      Answer,
      StudentLecture,
      Tag,
      User,
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
