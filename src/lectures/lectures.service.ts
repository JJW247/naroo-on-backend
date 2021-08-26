import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Lecture } from './entities/lecture.entity';
import { LectureTag } from './entities/lectureTag.entity';
import { Notice } from './entities/notice.entity';
import { Question } from './entities/question.entity';
import { StudentLecture } from './entities/studentLecture.entity';
import { Tag } from './entities/tag.entity';
import { Video } from './entities/video.entity';
import { RequestCreateLectureDto } from './dtos/request/requestCreateLecture.dto';
import { CONST_ROLE_TYPE, User } from 'src/users/entities/user.entity';
import { Request } from 'express';

@Injectable()
export class LecturesService {
  constructor(
    @InjectRepository(Lecture)
    private readonly lecturesRepository: Repository<Lecture>,
    @InjectRepository(LectureTag)
    private readonly lectureTagsRepository: Repository<LectureTag>,
    @InjectRepository(Notice)
    private readonly noticesRepository: Repository<Notice>,
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
    @InjectRepository(StudentLecture)
    private readonly studentLecturesRepository: Repository<StudentLecture>,
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
    @InjectRepository(Video)
    private readonly videosRepository: Repository<Video>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async createLecture(req: Request, createLectureDto: RequestCreateLectureDto) {
    if (!req.user) {
      return null;
    }
    const user = await this.usersRepository.findOne({
      where: {
        id: req.user,
      },
      select: ['role'],
    });
    if (
      typeof user.role === typeof CONST_ROLE_TYPE &&
      user.role !== CONST_ROLE_TYPE.ADMIN
    ) {
      throw new HttpException('관리자 권한이 없습니다!', HttpStatus.FORBIDDEN);
    }
    const lecture = await this.lecturesRepository.save({
      title: createLectureDto.title,
      description: createLectureDto.description,
      type: createLectureDto.type,
      thumbnail: createLectureDto.thumbnail,
      images: createLectureDto.images,
      expiredAt: createLectureDto.expiredAt,
      teacher: {
        id: createLectureDto.teacherId,
      },
    });
    return lecture;
  }

  async readLectures(req: Request) {
    if (!req.user) {
      return null;
    }
    // return await this.lecturesRepository
    //   .createQueryBuilder('lecture')
    //   .leftJoin('lecture.teacher', 'user')
    //   .where('user."id" = :studentId', { studentId: +req.user })
    //   .leftJoin('lecture.')
    //   .select(['lecture.title', 'lecture.thumbnail', 'user.nickname'])
    //   .orderBy('lecture.title', 'DESC')
    //   .getMany();
  }

  async readAllLectures() {
    return await this.lecturesRepository
      .createQueryBuilder('lecture')
      .leftJoin('lecture.teacher', 'teacher')
      .select(['lecture.title', 'lecture.thumbnail', 'teacher.nickname'])
      .orderBy('lecture.title', 'DESC')
      .getMany();
  }
}
