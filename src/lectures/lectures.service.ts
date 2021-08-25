import { Injectable } from '@nestjs/common';
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
import { ResponseCreateLectureDto } from './dtos/response/responseCreateLecture.dto';

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
    private readonly jwtService: JwtService,
  ) {}

  async createLecture(
    createLectureDto: RequestCreateLectureDto,
  ): Promise<ResponseCreateLectureDto> {
    const lecture = await this.lecturesRepository.save({
      title: createLectureDto.title,
      description: createLectureDto.description,
      type: createLectureDto.type,
      thumbnail: createLectureDto.thumbnail,
      images: createLectureDto.images,
      expiredAt: createLectureDto.expiredAt,
    });
    return lecture;
  }

  findAll() {
    return this.lecturesRepository.find();
  }
}
