import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RequestCreateLectureDto } from './dtos/request/requestCreateLecture.dto';
import { ResponseCreateLectureDto } from './dtos/response/responseCreateLecture.dto';
import { LecturesService } from './lectures.service';
import { Request } from 'express';

@Controller('lecture')
export class LecturesController {
  constructor(private readonly lecturesService: LecturesService) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createLecture(
    @Req() req: Request,
    @Body() requestCreateLectureDto: RequestCreateLectureDto,
  ): Promise<ResponseCreateLectureDto | string> {
    return await this.lecturesService.createLecture(
      req,
      requestCreateLectureDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async readLectures(@Req() req: Request) {
    return await this.lecturesService.readLectures(req);
  }

  @Get('/all')
  async readAllLectures() {
    return await this.lecturesService.readAllLectures();
  }

  @Put('/:lectureId')
  @UseGuards(JwtAuthGuard)
  async registerLecture(
    @Req() req: Request,
    @Param() param: { lectureId: string },
  ) {
    return await this.lecturesService.registerLecture(req, param);
  }
}
