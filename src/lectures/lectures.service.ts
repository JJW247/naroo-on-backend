import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Lecture } from './entities/lecture.entity';
import { LectureTag } from './entities/lectureTag.entity';
import { Notice } from './entities/notice.entity';
import { Question } from './entities/question.entity';
import {
  CONST_LECTURE_STATUS,
  StudentLecture,
} from './entities/studentLecture.entity';
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
    const test = await this.studentLecturesRepository
      .createQueryBuilder('student_lecture')
      .innerJoin('student_lecture.user', 'apply_student')
      .innerJoin('student_lecture.lecture', 'apply_lecture')
      .innerJoin('apply_lecture.teacher', 'lecture_teacher')
      .where('apply_student.id = :studentId', { studentId: +req.user })
      .andWhere('student_lecture.status = :status', {
        status: CONST_LECTURE_STATUS.APPLY,
      })
      .select([
        'apply_lecture.title AS title',
        'apply_lecture.thumbnail AS thumbnail',
        'lecture_teacher.nickname AS nickname',
        'apply_lecture.type AS type',
        'student_lecture.status AS status',
        'apply_lecture.expiredAt AS expired',
      ])
      .orderBy('apply_lecture.title', 'DESC')
      .getRawMany();

    console.log(test);

    return test;
  }

  async readAllLectures() {
    return await this.lecturesRepository
      .createQueryBuilder('lecture')
      .innerJoin('lecture.teacher', 'teacher')
      .select([
        'lecture.title AS title',
        'lecture.thumbnail AS thumbnail',
        'teacher.nickname AS nickname',
        'lecture.type AS type',
        'lecture.expiredAt AS expired',
      ])
      .orderBy('lecture.title', 'DESC')
      .getRawMany();
  }

  async registerLecture(req: Request, param: { lectureId: string }) {
    return await this.studentLecturesRepository.save({
      user: { id: +req.user },
      lecture: { id: +param.lectureId },
      status: CONST_LECTURE_STATUS.APPLY,
    });
  }
}
