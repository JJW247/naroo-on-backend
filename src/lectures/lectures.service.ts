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
import { ResponseCreateLectureDto } from './dtos/response/responseCreateLecture.dto';
import { LectureReview, RATING_TYPE } from './entities/lectureReview.entity';

import _ = require('lodash');

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
    return await this.lecturesRepository.save({
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
  }

  async readAllLectures() {
    try {
      const allLectures = await this.lecturesRepository
        .createQueryBuilder('lecture')
        .innerJoin('lecture.teacher', 'teacher')
        .select([
          'lecture.id AS id',
          'lecture.title AS title',
          'lecture.thumbnail AS thumbnail',
          'teacher.nickname AS nickname',
          'lecture.type AS type',
          'lecture.expiredAt AS expired',
        ])
        .orderBy('lecture.title', 'DESC')
        .getRawMany();
      const responseLectures = [];
      await allLectures.reduce(async (prevPromise, lecture) => {
        return prevPromise.then(async () => {
          const rawTags = await this.lectureTagsRepository
            .createQueryBuilder('lecture_tag')
            .innerJoin('lecture_tag.lecture', 'lecture')
            .innerJoin('lecture_tag.tag', 'tag')
            .where('lecture.id = :lectureId', { lectureId: lecture.id })
            .select(['tag.name AS name'])
            .orderBy('tag.name', 'DESC')
            .getRawMany();
          const tags = [];
          for (const tag of rawTags) {
            tags.push(tag.name);
          }
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
          for (const tag of rawTags) {
            tags.push(tag.name);
          }
          const filteredReviews = reviews ? [...reviews] : [];
          const totalRating = getAverageRating(filteredReviews);
          responseLectures.push({
            id: lecture.id,
            title: lecture.title,
            thumbnail: lecture.thumbnail,
            nickname: lecture.nickname,
            type: lecture.type,
            expired: lecture.expired,
            tags,
            average_rating: totalRating,
            reviews,
          });
        });
      }, Promise.resolve());
      return responseLectures;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async readLectureByIdGuest(param: { lectureId: string }) {
    try {
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
          'teacher.nickname AS nickname',
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
      const rawVideos = await this.videosRepository
        .createQueryBuilder('video')
        .innerJoin('video.lecture', 'lecture')
        .where('lecture.id = :lectureId', { lectureId: lecture.id })
        .select(['video.url AS url'])
        .orderBy('video.id', 'DESC')
        .getRawMany();
      const videos = [];
      for (const video of rawVideos) {
        videos.push(video.url);
      }
      const rawNotices = await this.noticesRepository
        .createQueryBuilder('notice')
        .innerJoin('notice.lecture', 'lecture')
        .where('lecture.id = :lectureId', {
          lectureId: lecture.id,
        })
        .select(['notice.title AS title', 'notice.description AS description'])
        .orderBy('notice.id', 'DESC')
        .getRawMany();
      const notices = [];
      for (const notice of rawNotices) {
        notices.push({
          title: notice.title,
          description: notice.description,
        });
      }
      const rawTags = await this.lectureTagsRepository
        .createQueryBuilder('lecture_tag')
        .innerJoin('lecture_tag.lecture', 'lecture')
        .innerJoin('lecture_tag.tag', 'tag')
        .where('lecture.id = :lectureId', { lectureId: lecture.id })
        .select(['tag.name AS name'])
        .orderBy('tag.name', 'DESC')
        .getRawMany();
      const tags = [];
      for (const tag of rawTags) {
        tags.push(tag.name);
      }
      const filteredReviews = reviews ? [...reviews] : [];
      const totalRating = getAverageRating(filteredReviews);
      return {
        id: lecture.id,
        title: lecture.title,
        description: lecture.description,
        thumbnail: lecture.thumbnail,
        images: lecture.images,
        nickname: lecture.nickname,
        type: lecture.type,
        status: null,
        expired: lecture.expired,
        videos,
        notices,
        tags,
        average_rating: totalRating,
        reviews: reviews ? reviews : [],
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async readLectureById(req: Request, param: { lectureId: string }) {
    try {
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
          'teacher.nickname AS nickname',
          'lecture.type AS type',
          'lecture.expiredAt AS expired',
        ])
        .getRawOne();
      const rawVideos = await this.videosRepository
        .createQueryBuilder('video')
        .innerJoin('video.lecture', 'lecture')
        .where('lecture.id = :lectureId', { lectureId: lecture.id })
        .select(['video.url AS url'])
        .orderBy('video.id', 'DESC')
        .getRawMany();
      const videos = [];
      for (const video of rawVideos) {
        videos.push(video.url);
      }
      const rawNotices = await this.noticesRepository
        .createQueryBuilder('notice')
        .innerJoin('notice.lecture', 'lecture')
        .where('lecture.id = :lectureId', {
          lectureId: lecture.id,
        })
        .select(['notice.title AS title', 'notice.description AS description'])
        .orderBy('notice.id', 'DESC')
        .getRawMany();
      const notices = [];
      for (const notice of rawNotices) {
        notices.push({
          title: notice.title,
          description: notice.description,
        });
      }
      const rawTags = await this.lectureTagsRepository
        .createQueryBuilder('lecture_tag')
        .innerJoin('lecture_tag.lecture', 'lecture')
        .innerJoin('lecture_tag.tag', 'tag')
        .where('lecture.id = :lectureId', { lectureId: lecture.id })
        .select(['tag.name AS name'])
        .orderBy('tag.name', 'DESC')
        .getRawMany();
      const tags = [];
      for (const tag of rawTags) {
        tags.push(tag.name);
      }
      const totalRating = getAverageRating(reviews);
      return {
        id: lecture.id,
        title: lecture.title,
        description: lecture.description,
        thumbnail: lecture.thumbnail,
        images: lecture.images,
        nickname: lecture.nickname,
        type: lecture.type,
        status,
        expired: lecture.expired,
        videos,
        notices,
        tags,
        average_rating: totalRating,
        reviews: reviews ? reviews : [],
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async readLectures(req: Request) {
    try {
      const approvedLectures = await this.studentLecturesRepository
        .createQueryBuilder('student_lecture')
        .innerJoin('student_lecture.user', 'apply_student')
        .innerJoin('student_lecture.lecture', 'apply_lecture')
        .innerJoin('apply_lecture.teacher', 'lecture_teacher')
        .where('apply_student.id = :studentId', { studentId: +req.user })
        .andWhere('student_lecture.status = :status', {
          status: CONST_LECTURE_STATUS.APPLY,
        })
        .select([
          'apply_lecture.id AS id',
          'apply_lecture.title AS title',
          'apply_lecture.thumbnail AS thumbnail',
          'lecture_teacher.nickname AS nickname',
          'apply_lecture.type AS type',
          'student_lecture.status AS status',
          'apply_lecture.expiredAt AS expired',
        ])
        .orderBy('apply_lecture.title', 'DESC')
        .getRawMany();
      const responseApprovedLectures = [];
      await approvedLectures.reduce(async (prevPromise, lecture) => {
        return prevPromise.then(async () => {
          const rawTags = await this.lectureTagsRepository
            .createQueryBuilder('lecture_tag')
            .innerJoin('lecture_tag.lecture', 'lecture')
            .innerJoin('lecture_tag.tag', 'tag')
            .where('lecture.id = :lectureId', { lectureId: lecture.id })
            .select(['tag.name AS name'])
            .orderBy('tag.name', 'DESC')
            .getRawMany();
          const tags = [];
          for (const tag of rawTags) {
            tags.push(tag.name);
          }
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
            nickname: lecture.nickname,
            type: lecture.type,
            expired: lecture.expired,
            tags,
            average_rating: totalRating,
            reviews,
          });
        });
      }, Promise.resolve());
      return responseApprovedLectures;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async registerLecture(param: { lectureId: string }, req: Request) {
    return await this.studentLecturesRepository.save({
      user: { id: +req.user },
      lecture: { id: +param.lectureId },
      status: CONST_LECTURE_STATUS.APPLY,
    });
  }

  async approveLecture(
    pathParam: { lectureId: string },
    req: Request,
    queryParam: { userId: string },
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
      status: CONST_LECTURE_STATUS.ACCEPT,
    });
  }

  async registerReview(
    param: { lectureId: string },
    req: Request,
    requestRegisterReviewDto: { review: string; rating: RATING_TYPE },
  ) {
    return await this.lectureReviewsRepository.save({
      student: { id: +req.user },
      lecture: { id: +param.lectureId },
      review: requestRegisterReviewDto.review,
      rating: requestRegisterReviewDto.rating,
    });
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
      .select(['tag.name AS name'])
      .orderBy('tag.name', 'DESC')
      .getRawMany();
  }

  async readTags(param: { lectureId: string }) {
    return await this.lectureTagsRepository
      .createQueryBuilder('lecture_tag')
      .innerJoin('lecture_tag.tag', 'tag')
      .innerJoin('lecture_tag.lecture', 'lecture')
      .where('lecture.id = :id', { id: +param.lectureId })
      .select(['tag.name AS name'])
      .orderBy('tag.name', 'DESC')
      .getRawMany();
  }

  async registerTag(
    req: Request,
    pathParam: { lectureId: string },
    queryParam: { ids: string[] },
  ) {
    try {
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
        throw new HttpException(
          '관리자 권한이 없습니다!',
          HttpStatus.FORBIDDEN,
        );
      }

      if (queryParam.ids.length <= 0) {
        return { ok: false };
      }

      const ids = Array.isArray(queryParam.ids)
        ? queryParam.ids
        : [queryParam.ids];

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
    } catch (error) {
      return { ok: false };
    }
  }
}
