import { PickType } from '@nestjs/swagger';
import { Lecture } from '../../entities/lecture.entity';

export class ResponseCreateLectureDto extends PickType(Lecture, [
  'title',
  'type',
  'thumbnail',
  'images',
  'expiredAt',
  'teacher',
]) {}
