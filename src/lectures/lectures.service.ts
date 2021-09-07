import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Lecture, LECTURE_TYPE } from './entities/lecture.entity';
import { LectureTag } from './entities/lectureTag.entity';
import { Question } from './entities/question.entity';
import {
  CONST_LECTURE_STATUS,
  LECTURE_STATUS,
  StudentLecture,
} from './entities/studentLecture.entity';
import { Tag } from './entities/tag.entity';
import { Video } from './entities/video.entity';
import { RequestCreateLectureDto } from './dtos/request/requestCreateLecture.dto';
import { CONST_ROLE_TYPE, User } from 'src/users/entities/user.entity';
import { Request } from 'express';
import { ResponseCreateLectureDto } from './dtos/response/responseCreateLecture.dto';
import { LectureReview, RATING_TYPE } from './entities/lectureReview.entity';

import _ = require('lodash');
import { LectureNotice } from './entities/lectureNotice.entity';

function getAverageRating(filteredReviews: any[]) {
  _.each(filteredReviews, (review) => _.update(review, 'rating', _.parseInt));
  const totalRating =
    !filteredReviews || filteredReviews.length === 0
      ? 0
      : Math.round(
          (_.sumBy(['rating'], _.partial(_.sumBy, filteredReviews)) /
            filteredReviews.length) *
            2,
        ) / 2;
  return totalRating;
}

@Injectable()
export class LecturesService {
  constructor(
    @InjectRepository(Lecture)
    private readonly lecturesRepository: Repository<Lecture>,
    @InjectRepository(LectureTag)
    private readonly lectureTagsRepository: Repository<LectureTag>,
    @InjectRepository(LectureNotice)
    private readonly lectureNoticesRepository: Repository<LectureNotice>,
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
    @InjectRepository(LectureReview)
    private readonly lectureReviewsRepository: Repository<LectureReview>,
    private readonly jwtService: JwtService,
  ) {}

  async createLecture(
    req: Request,
    requestCreateLectureDto: RequestCreateLectureDto,
  ): Promise<ResponseCreateLectureDto | string> {
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
      title: requestCreateLectureDto.title,
      description: requestCreateLectureDto.description,
      type: requestCreateLectureDto.type,
      thumbnail: requestCreateLectureDto.thumbnail,
      images: requestCreateLectureDto.images,
      expiredAt: requestCreateLectureDto.expiredAt,
      teacher: {
        id: requestCreateLectureDto.teacherId,
      },
    });
    for (const video of requestCreateLectureDto.videos) {
      await this.videosRepository.save({
        title: video.title,
        url: video.url,
        lecture: { id: lecture.id },
      });
    }
    return lecture;
  }

  async updateLectureInfo(
    param: { lectureId: string },
    req: Request,
    updateLectureInfoDto: {
      thumbnail: string | null;
      type: LECTURE_TYPE | null;
      expired: Date | null;
      title: string | null;
      description: string | null;
      teacherId: string | null;
      images: string[] | null;
      videos: { url: string; title: string }[] | null;
    },
  ) {
    const user = await this.usersRepository.findOne({
      where: {
        id: +req.user,
      },
      select: ['role'],
    });
    if (
      typeof user.role === typeof CONST_ROLE_TYPE &&
      user.role !== CONST_ROLE_TYPE.ADMIN
    ) {
      throw new HttpException('관리자 권한이 없습니다!', HttpStatus.FORBIDDEN);
    }
    const existLecture = await this.lecturesRepository.findOne({
      where: {
        id: +param.lectureId,
      },
    });
    existLecture.thumbnail = updateLectureInfoDto.thumbnail
      ? updateLectureInfoDto.thumbnail
      : existLecture.thumbnail;
    existLecture.type = updateLectureInfoDto.type
      ? updateLectureInfoDto.type
      : existLecture.type;
    existLecture.expiredAt = updateLectureInfoDto.expired
      ? updateLectureInfoDto.expired
      : existLecture.expiredAt;
    existLecture.title = updateLectureInfoDto.title
      ? updateLectureInfoDto.title
      : existLecture.title;
    existLecture.description = updateLectureInfoDto.description
      ? updateLectureInfoDto.description
      : existLecture.description;
    if (updateLectureInfoDto.teacherId) {
      const existTeacher = await this.usersRepository.findOne(
        +updateLectureInfoDto.teacherId,
      );
      existLecture.teacher = existTeacher;
    }
    // 강사, 이미지 array, 영상 array
    return await this.lecturesRepository.save(existLecture);
  }

  async deleteLecture(param: { lectureId: string }, req: Request) {
    const user = await this.usersRepository.findOne({
      where: {
        id: +req.user,
      },
      select: ['role'],
    });
    if (
      typeof user.role === typeof CONST_ROLE_TYPE &&
      user.role !== CONST_ROLE_TYPE.ADMIN
    ) {
      throw new HttpException('관리자 권한이 없습니다!', HttpStatus.FORBIDDEN);
    }
    const lecture = await this.lecturesRepository.findOne({
      where: {
        id: +param.lectureId,
      },
    });
    const result = await this.lecturesRepository.delete({ id: lecture.id });
    return result.affected === 1 ? { ok: true } : { ok: false };
  }

  async readAllLectures() {
    const allLectures = await this.lecturesRepository
      .createQueryBuilder('lecture')
      .innerJoin('lecture.teacher', 'teacher')
      .select([
        'lecture.id AS id',
        'lecture.title AS title',
        'lecture.description AS description',
        'lecture.thumbnail AS thumbnail',
        'teacher.id AS teacher_id',
        'teacher.nickname AS teacher_nickname',
        'lecture.type AS type',
        'lecture.expiredAt AS expired',
      ])
      .orderBy('lecture.title', 'DESC')
      .getRawMany();
    const responseLectures = [];
    await allLectures.reduce(async (prevPromise, lecture) => {
      return prevPromise.then(async () => {
        const tags = await this.lectureTagsRepository
          .createQueryBuilder('lecture_tag')
          .innerJoin('lecture_tag.lecture', 'lecture')
          .innerJoin('lecture_tag.tag', 'tag')
          .where('lecture.id = :lectureId', { lectureId: lecture.id })
          .select(['tag.id AS id', 'tag.name AS name'])
          .orderBy('tag.name', 'DESC')
          .getRawMany();
        const reviews = await this.lectureReviewsRepository
          .createQueryBuilder('lecture_review')
          .innerJoin('lecture_review.lecture', 'review_lecture')
          .innerJoin('lecture_review.student', 'review_student')
          .where('review_lecture.id = :lectureId', {
            lectureId: lecture.id,
          })
          .select([
            'lecture_review.createdAt AS created_at',
            'review_student.id AS id',
            'review_student.nickname AS nickname',
            'lecture_review.review AS review',
            'lecture_review.rating AS rating',
          ])
          .orderBy('created_at', 'DESC')
          .getRawMany();
        const filteredReviews = reviews ? [...reviews] : [];
        const totalRating = getAverageRating(filteredReviews);
        responseLectures.push({
          id: lecture.id,
          title: lecture.title,
          description: lecture.description,
          thumbnail: lecture.thumbnail,
          teacher_id: lecture.teacher_id,
          teacher_nickname: lecture.teacher_nickname,
          type: lecture.type,
          expired: lecture.expired,
          tags,
          average_rating: totalRating,
          reviews,
        });
      });
    }, Promise.resolve());
    return responseLectures;
  }

  async readLectureByIdGuest(param: { lectureId: string }) {
    const lecture = await this.lecturesRepository
      .createQueryBuilder('lecture')
      .innerJoin('lecture.teacher', 'teacher')
      .where('lecture.id = :lectureId', { lectureId: +param.lectureId })
      .select([
        'lecture.id AS id',
        'lecture.title AS title',
        'lecture.description AS description',
        'lecture.thumbnail AS thumbnail',
        'lecture.images AS images',
        'teacher.id AS teacher_id',
        'teacher.nickname AS teacher_nickname',
        'lecture.type AS type',
        'lecture.expiredAt AS expired',
      ])
      .getRawOne();
    const reviews = await this.lectureReviewsRepository
      .createQueryBuilder('lecture_review')
      .innerJoin('lecture_review.lecture', 'review_lecture')
      .innerJoin('lecture_review.student', 'review_student')
      .where('review_lecture.id = :lectureId', {
        lectureId: +param.lectureId,
      })
      .select([
        'lecture_review.createdAt AS created_at',
        'review_student.id AS id',
        'review_student.nickname AS nickname',
        'lecture_review.review AS review',
        'lecture_review.rating AS rating',
      ])
      .orderBy('created_at', 'DESC')
      .getRawMany();
    const videos = await this.videosRepository
      .createQueryBuilder('video')
      .innerJoin('video.lecture', 'lecture')
      .where('lecture.id = :lectureId', { lectureId: lecture.id })
      .select(['video.id AS id'])
      .orderBy('video.id', 'ASC')
      .getRawMany();
    const notices = await this.lectureNoticesRepository
      .createQueryBuilder('lecture_notice')
      .innerJoin('lecture_notice.lecture', 'lecture')
      .innerJoin('lecture_notice.creator', 'creator')
      .where('lecture.id = :lectureId', {
        lectureId: lecture.id,
      })
      .select([
        'lecture_notice.id AS id',
        'lecture_notice.createdAt AS created_at',
        'creator.id AS creator_id',
        'creator.nickname AS creator_nickname',
        'lecture_notice.title AS title',
        'lecture_notice.description AS description',
      ])
      .orderBy('lecture_notice.id', 'DESC')
      .getRawMany();
    const tags = await this.lectureTagsRepository
      .createQueryBuilder('lecture_tag')
      .innerJoin('lecture_tag.lecture', 'lecture')
      .innerJoin('lecture_tag.tag', 'tag')
      .where('lecture.id = :lectureId', { lectureId: lecture.id })
      .select(['tag.id AS id', 'tag.name AS name'])
      .orderBy('tag.name', 'DESC')
      .getRawMany();
    const filteredReviews = reviews ? [...reviews] : [];
    const totalRating = getAverageRating(filteredReviews);
    const users = await this.studentLecturesRepository
      .createQueryBuilder('student_lecture')
      .innerJoin('student_lecture.user', 'apply_student')
      .innerJoin('student_lecture.lecture', 'apply_lecture')
      .where('apply_lecture.id = :lectureId', {
        lectureId: +param.lectureId,
      })
      .andWhere('student_lecture.status = :status', {
        status: CONST_LECTURE_STATUS.ACCEPT,
      })
      .getCount();
    return {
      id: lecture.id,
      title: lecture.title,
      description: lecture.description,
      thumbnail: lecture.thumbnail,
      images: lecture.images,
      teacher_id: lecture.teacher_id,
      teacher_nickname: lecture.teacher_nickname,
      type: lecture.type,
      expired: lecture.expired,
      videos,
      notices,
      tags,
      average_rating: totalRating,
      reviews: reviews ? reviews : [],
      users,
    };
  }

  async readLectureById(req: Request, param: { lectureId: string }) {
    const user = await this.studentLecturesRepository
      .createQueryBuilder('student_lecture')
      .innerJoin('student_lecture.user', 'apply_student')
      .innerJoin('student_lecture.lecture', 'apply_lecture')
      .where('apply_student.id = :studentId', { studentId: +req.user })
      .andWhere('apply_lecture.id = :lectureId', {
        lectureId: +param.lectureId,
      })
      .select(['student_lecture.status AS status'])
      .getRawOne();
    const reviews = await this.lectureReviewsRepository
      .createQueryBuilder('lecture_review')
      .innerJoin('lecture_review.lecture', 'review_lecture')
      .innerJoin('lecture_review.student', 'review_student')
      .where('review_lecture.id = :lectureId', {
        lectureId: +param.lectureId,
      })
      .select([
        'lecture_review.createdAt AS created_at',
        'review_student.id AS id',
        'review_student.nickname AS nickname',
        'lecture_review.review AS review',
        'lecture_review.rating AS rating',
      ])
      .orderBy('created_at', 'DESC')
      .getRawMany();
    const status = !user || !user.status ? null : user.status;
    const lecture = await this.lecturesRepository
      .createQueryBuilder('lecture')
      .innerJoin('lecture.teacher', 'teacher')
      .where('lecture.id = :lectureId', { lectureId: +param.lectureId })
      .select([
        'lecture.id AS id',
        'lecture.title AS title',
        'lecture.description AS description',
        'lecture.thumbnail AS thumbnail',
        'lecture.images AS images',
        'teacher.id AS teacher_id',
        'teacher.nickname AS teacher_nickname',
        'lecture.type AS type',
        'lecture.expiredAt AS expired',
      ])
      .getRawOne();
    const videos = await this.videosRepository
      .createQueryBuilder('video')
      .innerJoin('video.lecture', 'lecture')
      .where('lecture.id = :lectureId', { lectureId: lecture.id })
      .select(['video.id AS id'])
      .orderBy('video.id', 'ASC')
      .getRawMany();
    const notices = await this.lectureNoticesRepository
      .createQueryBuilder('lecture_notice')
      .innerJoin('lecture_notice.lecture', 'lecture')
      .innerJoin('lecture_notice.creator', 'creator')
      .where('lecture.id = :lectureId', {
        lectureId: lecture.id,
      })
      .select([
        'lecture_notice.id AS id',
        'lecture_notice.createdAt AS created_at',
        'creator.id AS creator_id',
        'creator.nickname AS creator_nickname',
        'lecture_notice.title AS title',
        'lecture_notice.description AS description',
      ])
      .orderBy('lecture_notice.id', 'DESC')
      .getRawMany();
    const tags = await this.lectureTagsRepository
      .createQueryBuilder('lecture_tag')
      .innerJoin('lecture_tag.lecture', 'lecture')
      .innerJoin('lecture_tag.tag', 'tag')
      .where('lecture.id = :lectureId', { lectureId: lecture.id })
      .select(['tag.id AS id', 'tag.name AS name'])
      .orderBy('tag.name', 'DESC')
      .getRawMany();
    const totalRating = getAverageRating(reviews);
    const users = await this.studentLecturesRepository
      .createQueryBuilder('student_lecture')
      .innerJoin('student_lecture.user', 'apply_student')
      .innerJoin('student_lecture.lecture', 'apply_lecture')
      .where('apply_lecture.id = :lectureId', {
        lectureId: +param.lectureId,
      })
      .andWhere('student_lecture.status = :status', {
        status: CONST_LECTURE_STATUS.ACCEPT,
      })
      .getCount();
    return {
      id: lecture.id,
      title: lecture.title,
      description: lecture.description,
      thumbnail: lecture.thumbnail,
      images: lecture.images,
      teacher_id: lecture.teacher_id,
      teacher_nickname: lecture.teacher_nickname,
      type: lecture.type,
      status,
      expired: lecture.expired,
      videos,
      notices,
      tags,
      average_rating: totalRating,
      reviews: reviews ? reviews : [],
      users,
    };
  }

  async readLectureVideoById(req: Request, param: { lectureId: string }) {
    const user = await this.studentLecturesRepository
      .createQueryBuilder('student_lecture')
      .innerJoin('student_lecture.user', 'apply_student')
      .innerJoin('student_lecture.lecture', 'apply_lecture')
      .where('apply_student.id = :studentId', { studentId: +req.user })
      .andWhere('apply_lecture.id = :lectureId', {
        lectureId: +param.lectureId,
      })
      .select(['student_lecture.status AS status'])
      .getRawOne();
    const status = !user || !user.status ? null : user.status;
    const lecture = await this.lecturesRepository
      .createQueryBuilder('lecture')
      .innerJoin('lecture.teacher', 'teacher')
      .where('lecture.id = :lectureId', { lectureId: +param.lectureId })
      .select([
        'lecture.id AS id',
        'lecture.title AS title',
        'lecture.description AS description',
        'lecture.thumbnail AS thumbnail',
        'lecture.images AS images',
        'teacher.id AS teacher_id',
        'teacher.nickname AS teacher_nickname',
        'lecture.type AS type',
        'lecture.expiredAt AS expired',
      ])
      .getRawOne();
    const videos = await this.videosRepository
      .createQueryBuilder('video')
      .innerJoin('video.lecture', 'lecture')
      .where('lecture.id = :lectureId', { lectureId: lecture.id })
      .select(['video.id AS id', 'video.url AS url', 'video.title AS title'])
      .orderBy('video.id', 'ASC')
      .getRawMany();
    const tags = await this.lectureTagsRepository
      .createQueryBuilder('lecture_tag')
      .innerJoin('lecture_tag.lecture', 'lecture')
      .innerJoin('lecture_tag.tag', 'tag')
      .where('lecture.id = :lectureId', { lectureId: lecture.id })
      .select(['tag.id AS id', 'tag.name AS name'])
      .orderBy('tag.name', 'DESC')
      .getRawMany();
    const users = await this.studentLecturesRepository
      .createQueryBuilder('student_lecture')
      .innerJoin('student_lecture.user', 'apply_student')
      .innerJoin('student_lecture.lecture', 'apply_lecture')
      .where('apply_lecture.id = :lectureId', {
        lectureId: +param.lectureId,
      })
      .andWhere('student_lecture.status = :status', {
        status: CONST_LECTURE_STATUS.ACCEPT,
      })
      .getCount();
    return {
      id: lecture.id,
      title: lecture.title,
      description: lecture.description,
      thumbnail: lecture.thumbnail,
      images: lecture.images,
      teacher_id: lecture.teacher_id,
      teacher_nickname: lecture.teacher_nickname,
      type: lecture.type,
      status,
      expired: lecture.expired,
      videos,
      tags,
      users,
    };
  }

  async readLectures(req: Request) {
    const lectureOnStatuses = await this.studentLecturesRepository
      .createQueryBuilder('student_lecture')
      .innerJoin('student_lecture.user', 'apply_student')
      .innerJoin('student_lecture.lecture', 'apply_lecture')
      .innerJoin('apply_lecture.teacher', 'lecture_teacher')
      .where('apply_student.id = :studentId', { studentId: +req.user })
      .andWhere('student_lecture.status IN (:...statuses)', {
        statuses: [CONST_LECTURE_STATUS.APPLY, CONST_LECTURE_STATUS.ACCEPT],
      })
      .select([
        'apply_lecture.id AS id',
        'apply_lecture.title AS title',
        'apply_lecture.thumbnail AS thumbnail',
        'lecture_teacher.id AS teacher_id',
        'lecture_teacher.nickname AS teacher_nickname',
        'apply_lecture.type AS type',
        'student_lecture.status AS status',
        'apply_lecture.expiredAt AS expired',
      ])
      .orderBy('apply_lecture.title', 'DESC')
      .getRawMany();
    const responseApprovedLectures = [];
    await lectureOnStatuses.reduce(async (prevPromise, lecture) => {
      return prevPromise.then(async () => {
        const tags = await this.lectureTagsRepository
          .createQueryBuilder('lecture_tag')
          .innerJoin('lecture_tag.lecture', 'lecture')
          .innerJoin('lecture_tag.tag', 'tag')
          .where('lecture.id = :lectureId', { lectureId: lecture.id })
          .select(['tag.id AS id', 'tag.name AS name'])
          .orderBy('tag.name', 'DESC')
          .getRawMany();
        const reviews = await this.lectureReviewsRepository
          .createQueryBuilder('lecture_review')
          .innerJoin('lecture_review.lecture', 'review_lecture')
          .innerJoin('lecture_review.student', 'review_student')
          .where('review_lecture.id = :lectureId', {
            lectureId: lecture.id,
          })
          .select([
            'lecture_review.createdAt AS created_at',
            'review_student.id AS id',
            'review_student.nickname AS nickname',
            'lecture_review.review AS review',
            'lecture_review.rating AS rating',
          ])
          .orderBy('created_at', 'DESC')
          .getRawMany();
        const totalRating = getAverageRating(reviews);
        responseApprovedLectures.push({
          id: lecture.id,
          title: lecture.title,
          thumbnail: lecture.thumbnail,
          teacher_id: lecture.teacher_id,
          teacher_nickname: lecture.teacher_nickname,
          type: lecture.type,
          status: lecture.status,
          expired: lecture.expired,
          tags,
          average_rating: totalRating,
          reviews,
        });
      });
    }, Promise.resolve());
    return responseApprovedLectures;
  }

  async readLectureStatuses(req: Request) {
    const user = await this.usersRepository.findOne({
      where: {
        id: +req.user,
      },
      select: ['role'],
    });
    if (
      typeof user.role === typeof CONST_ROLE_TYPE &&
      user.role !== CONST_ROLE_TYPE.ADMIN
    ) {
      throw new HttpException('관리자 권한이 없습니다!', HttpStatus.FORBIDDEN);
    }
    return await this.studentLecturesRepository
      .createQueryBuilder('student_lecture')
      .innerJoin('student_lecture.user', 'apply_student')
      .innerJoin('student_lecture.lecture', 'apply_lecture')
      .innerJoin('apply_lecture.teacher', 'lecture_teacher')
      .select([
        'apply_student.id AS student_id',
        'apply_lecture.id AS lecture_id',
        'apply_lecture.title AS title',
        'apply_lecture.thumbnail AS thumbnail',
        'lecture_teacher.id AS teacher_id',
        'lecture_teacher.nickname AS teacher_nickname',
        'apply_lecture.type AS type',
        'student_lecture.status AS status',
        'apply_lecture.expiredAt AS expired',
      ])
      .orderBy('apply_lecture.title', 'DESC')
      .getRawMany();
  }

  async registerLecture(param: { lectureId: string }, req: Request) {
    const user = await this.usersRepository.findOne({
      where: {
        id: +req.user,
      },
      select: ['role'],
    });
    if (user.role && user.role !== CONST_ROLE_TYPE.STUDENT) {
      throw new HttpException(
        '강의 신청은 학생만 가능합니다!',
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.studentLecturesRepository.save({
      user: { id: +req.user },
      lecture: { id: +param.lectureId },
      status: CONST_LECTURE_STATUS.APPLY,
    });
  }

  async updateLectureStatus(
    pathParam: { lectureId: string },
    req: Request,
    queryParam: { userId: string },
    requestUpdateLectureStatus: { status: LECTURE_STATUS },
  ) {
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
    return await this.studentLecturesRepository.save({
      user: { id: +queryParam.userId },
      lecture: { id: +pathParam.lectureId },
      status: requestUpdateLectureStatus.status,
    });
  }

  async registerReview(
    param: { lectureId: string },
    req: Request,
    requestRegisterReviewDto: { review: string; rating: RATING_TYPE },
  ) {
    const user = await this.usersRepository.findOne({
      where: {
        id: +req.user,
      },
      select: ['role'],
    });
    if (
      typeof user.role === typeof CONST_ROLE_TYPE &&
      user.role !== CONST_ROLE_TYPE.STUDENT
    ) {
      throw new HttpException(
        '리뷰 등록은 학생만 가능합니다!',
        HttpStatus.FORBIDDEN,
      );
    }
    const existReview = await this.lectureReviewsRepository
      .createQueryBuilder('lecture_review')
      .innerJoin('lecture_review.lecture', 'review_lecture')
      .innerJoin('lecture_review.student', 'review_student')
      .where('review_lecture.id = :lectureId', {
        lectureId: +param.lectureId,
      })
      .andWhere('review_student.id = :studentId', {
        studentId: +req.user,
      })
      .select([
        'lecture_review.review AS review',
        'lecture_review.rating AS rating',
      ])
      .getRawOne();
    if (existReview) {
      throw new HttpException(
        '이미 등록된 강의 리뷰가 존재합니다!',
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.lectureReviewsRepository.save({
      student: { id: +req.user },
      lecture: { id: +param.lectureId },
      review: requestRegisterReviewDto.review,
      rating: requestRegisterReviewDto.rating,
    });
  }

  async readRecentReviews() {
    return await this.lectureReviewsRepository
      .createQueryBuilder('lecture_review')
      .innerJoin('lecture_review.lecture', 'review_lecture')
      .innerJoin('lecture_review.student', 'review_student')
      .select([
        'lecture_review.createdAt AS created_at',
        'review_student.id AS student_id',
        'review_student.nickname AS student_nickname',
        'review_lecture.id AS lecture_id',
        'review_lecture.title AS lecture_title',
        'lecture_review.review AS review',
        'lecture_review.rating AS rating',
      ])
      .limit(5)
      .orderBy('created_at', 'DESC')
      .getRawMany();
  }

  async createTag(req: Request, requestCreateTagDto: { name: string }) {
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
    return await this.tagsRepository.save({
      name: requestCreateTagDto.name,
    });
  }

  async readAllTags(req: Request) {
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
    return await this.tagsRepository
      .createQueryBuilder('tag')
      .select(['tag.id AS id', 'tag.name AS name'])
      .orderBy('tag.name', 'DESC')
      .getRawMany();
  }

  async readTags(param: { lectureId: string }) {
    return await this.lectureTagsRepository
      .createQueryBuilder('lecture_tag')
      .innerJoin('lecture_tag.tag', 'tag')
      .innerJoin('lecture_tag.lecture', 'lecture')
      .where('lecture.id = :id', { id: +param.lectureId })
      .select(['tag.id AS id', 'tag.name AS name'])
      .orderBy('tag.name', 'DESC')
      .getRawMany();
  }

  async updateTag(
    param: { tagId: string },
    req: Request,
    updateTagDto: { tagName: string },
  ) {
    const user = await this.usersRepository.findOne({
      where: {
        id: +req.user,
      },
      select: ['role'],
    });
    if (
      typeof user.role === typeof CONST_ROLE_TYPE &&
      user.role !== CONST_ROLE_TYPE.ADMIN
    ) {
      throw new HttpException('관리자 권한이 없습니다!', HttpStatus.FORBIDDEN);
    }
    const tag = await this.tagsRepository.findOne({
      where: {
        id: +param.tagId,
      },
    });
    tag.name = updateTagDto.tagName;
    return await this.tagsRepository.save(tag);
  }

  async deleteTag(param: { tagId: string }, req: Request) {
    const user = await this.usersRepository.findOne({
      where: {
        id: +req.user,
      },
      select: ['role'],
    });
    if (
      typeof user.role === typeof CONST_ROLE_TYPE &&
      user.role !== CONST_ROLE_TYPE.ADMIN
    ) {
      throw new HttpException('관리자 권한이 없습니다!', HttpStatus.FORBIDDEN);
    }
    const tag = await this.tagsRepository.findOne({
      where: {
        id: +param.tagId,
      },
    });
    const result = await this.tagsRepository.delete({ id: tag.id });
    return result.affected === 1 ? { ok: true } : { ok: false };
  }

  async registerTag(
    req: Request,
    pathParam: { lectureId: string },
    registerTagDto: { ids: string[] },
  ) {
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

    if (registerTagDto.ids.length <= 0) {
      return { ok: false };
    }

    const ids = Array.isArray(registerTagDto.ids)
      ? registerTagDto.ids
      : [registerTagDto.ids];

    const existTags = await this.lectureTagsRepository
      .createQueryBuilder('lecture_tag')
      .innerJoin('lecture_tag.lecture', 'lecture')
      .innerJoin('lecture_tag.tag', 'tag')
      .where('lecture.id = :lectureId', { lectureId: pathParam.lectureId })
      .select(['tag.id AS id'])
      .orderBy('tag.id', 'DESC')
      .getRawMany();

    await existTags
      .reduce((prevPromise, existTag) => {
        return prevPromise.then(() =>
          this.lectureTagsRepository.delete({
            lecture: { id: +pathParam.lectureId },
            tag: { id: existTag.id },
          }),
        );
      }, Promise.resolve())
      .then(() => {
        ids.reduce((prevPromise, id) => {
          return prevPromise.then(() =>
            this.lectureTagsRepository.save({
              lecture: { id: +pathParam.lectureId },
              tag: { id: +id },
            }),
          );
        }, Promise.resolve());
      });
    return { ok: true };
  }

  async unregisterTag(
    req: Request,
    pathParam: { lectureId: string },
    unregisterTagDto: { id: string },
  ) {
    const user = await this.usersRepository.findOne({
      where: {
        id: +req.user,
      },
      select: ['role'],
    });
    if (
      typeof user.role === typeof CONST_ROLE_TYPE &&
      user.role !== CONST_ROLE_TYPE.ADMIN
    ) {
      throw new HttpException('관리자 권한이 없습니다!', HttpStatus.FORBIDDEN);
    }

    const existTag = await this.lectureTagsRepository
      .createQueryBuilder('lecture_tag')
      .innerJoin('lecture_tag.lecture', 'lecture')
      .innerJoin('lecture_tag.tag', 'tag')
      .where('lecture.id = :lectureId', { lectureId: pathParam.lectureId })
      .where('tag.id = :tagId', { tagId: unregisterTagDto.id })
      .select(['lecture.id AS lecture_id', 'tag.id AS tag_id'])
      .getRawOne();

    if (!existTag) {
      throw new HttpException(
        '존재하지 않는 태그입니다!',
        HttpStatus.FORBIDDEN,
      );
    }

    const result = await this.lectureTagsRepository.delete({
      lecture: { id: existTag.lecture_id },
      tag: { id: existTag.tag_id },
    });
    return result.affected === 1 ? { ok: true } : { ok: false };
  }

  async createNotice(
    param: { lectureId: string },
    req: Request,
    requestCreateNoticeDto: {
      title: string;
      description: string;
    },
  ) {
    const user = await this.usersRepository.findOne({
      where: {
        id: +req.user,
      },
      select: ['role'],
    });
    if (
      typeof user.role === typeof CONST_ROLE_TYPE &&
      user.role !== CONST_ROLE_TYPE.ADMIN
    ) {
      throw new HttpException('관리자 권한이 없습니다!', HttpStatus.FORBIDDEN);
    }
    const lecture = await this.lecturesRepository
      .createQueryBuilder('lecture')
      .innerJoin('lecture.teacher', 'lecture_teacher')
      .where('lecture.id = :lectureId', { lectureId: +param.lectureId })
      .select(['lecture_teacher.id AS teacher_id'])
      .getRawOne();
    if (
      (typeof user.role === typeof CONST_ROLE_TYPE &&
        user.role !== CONST_ROLE_TYPE.TEACHER) ||
      (user.role === CONST_ROLE_TYPE.TEACHER &&
        lecture.teacher_id !== +req.user)
    ) {
      throw new HttpException(
        '해당 강의에 대한 권한이 없습니다!',
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.lectureNoticesRepository.save({
      lecture: { id: +param.lectureId },
      creator: { id: +req.user },
      title: requestCreateNoticeDto.title,
      description: requestCreateNoticeDto.description,
    });
  }

  async readNotices(param: { lectureId: string }) {
    return await this.lectureNoticesRepository
      .createQueryBuilder('lecture_notice')
      .innerJoin('lecture_notice.lecture', 'lecture')
      .innerJoin('lecture_notice.creator', 'creator')
      .where('lecture.id = :lectureId', {
        lectureId: +param.lectureId,
      })
      .select([
        'lecture_notice.id AS id',
        'lecture_notice.createdAt AS created_at',
        'lecture_notice.creator AS creator',
        'lecture_notice.title AS title',
        'lecture_notice.description AS description',
      ])
      .orderBy('lecture_notice.createdAt', 'DESC')
      .getRawMany();
  }

  async createQuestion(
    param: { lectureId: string },
    req: Request,
    requestCreateQuestionDto: { title: string; description: string },
  ) {
    const user = await this.usersRepository.findOne({
      where: {
        id: req.user,
      },
      select: ['role'],
    });
    if (
      typeof user.role === typeof CONST_ROLE_TYPE &&
      user.role !== CONST_ROLE_TYPE.STUDENT
    ) {
      throw new HttpException(
        '문의는 학생 권한이 필요합니다!',
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.questionsRepository.save({
      lecture: { id: +param.lectureId },
      student: { id: +req.user },
      questionTitle: requestCreateQuestionDto.title,
      questionDescription: requestCreateQuestionDto.description,
    });
  }

  async createAnswer(
    param: { lectureId: string },
    req: Request,
    requestCreateAnswerDto: { title: string; description: string },
  ) {
    // Need to Permission Check Whether Lecture is of Teacher Id
    const user = await this.usersRepository.findOne({
      where: {
        id: req.user,
      },
      select: ['role'],
    });
    if (
      typeof user.role === typeof CONST_ROLE_TYPE &&
      user.role !== CONST_ROLE_TYPE.TEACHER
    ) {
      throw new HttpException(
        '답변은 강사 권한이 필요합니다!',
        HttpStatus.FORBIDDEN,
      );
    }
    // return await this.questionsRepository.save({
    //   lecture: { id: +param.lectureId },
    //   answerTitle: requestCreateAnswerDto.title,
    //   answerDescription: requestCreateAnswerDto.description,
    // });
  }

  async readQnas(param: { lectureId: string }) {
    return await this.questionsRepository
      .createQueryBuilder('question')
      .innerJoin('question.lecture', 'lecture')
      .innerJoin('question.student', 'student')
      .innerJoin('question.teacher', 'teacher')
      .where('lecture.id = :id', { id: +param.lectureId })
      .select([
        'question.createdAt AS question_created_at',
        'question.title AS questionTitle',
        'question.description AS questionDescription',
        'answer.createdAt AS answer_created_at',
        'answer.title AS answerTitle',
        'answer.description AS answerDescription',
      ])
      .orderBy('question.createdAt', 'DESC')
      .getRawMany();
  }
}
