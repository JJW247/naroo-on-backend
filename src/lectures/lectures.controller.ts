import { Body, Controller, Get, Post } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateLectureDto } from './dtos/createLecture.dto';
import { LecturesService } from './lectures.service';

@Controller('lecture')
export class LecturesController {
  constructor(private readonly lecturesService: LecturesService) {}

  @Post('/create')
  async createLecture(@Body() signUpDto: CreateLectureDto) {
    return await this.lecturesService.createLecture(signUpDto);
  }

  @Get()
  async readLectures() {
    return await this.lecturesService.findAll();
  }
}
