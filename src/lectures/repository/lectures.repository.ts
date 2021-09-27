import { EntityRepository, Repository } from 'typeorm';
import { RequestLectureIdDto } from '../dto/request/request-lecture-id.dto';
import { RequestUpdateLectureInfoDto } from '../dto/request/request-update-lecture-info.dto';
import { Lecture } from '../entity/lecture.entity';

@EntityRepository(Lecture)
export class LecturesRepository extends Repository<Lecture> {
  async updateLectureInfo(
    param: RequestLectureIdDto,
    requestUpdateLectureInfoDto: RequestUpdateLectureInfoDto,
  ) {
    const existLecture = await this.findOne({
      where: {
        id: +param.lectureId,
      },
    });
    existLecture.thumbnail = requestUpdateLectureInfoDto.thumbnail
      ? requestUpdateLectureInfoDto.thumbnail
      : existLecture.thumbnail;
    existLecture.expiredAt = requestUpdateLectureInfoDto.expired
      ? requestUpdateLectureInfoDto.expired
      : existLecture.expiredAt;
    existLecture.title = requestUpdateLectureInfoDto.title
      ? requestUpdateLectureInfoDto.title
      : existLecture.title;
    existLecture.description = requestUpdateLectureInfoDto.description
      ? requestUpdateLectureInfoDto.description
      : existLecture.description;
    existLecture.teacherName = requestUpdateLectureInfoDto.teacherName
      ? requestUpdateLectureInfoDto.teacherName
      : existLecture.teacherName;
    return await this.save(existLecture);
  }

  async deleteLecture(param: RequestLectureIdDto) {
    const lecture = await this.findOne({
      where: {
        id: +param.lectureId,
      },
    });
    const result = await this.delete({ id: lecture.id });
    return result.affected === 1 ? { ok: true } : { ok: false };
  }
}
