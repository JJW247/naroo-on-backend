import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RequestCreateLectureDto } from './dtos/request/requestCreateLecture.dto';
import { ResponseCreateLectureDto } from './dtos/response/responseCreateLecture.dto';
import { LecturesService } from './lectures.service';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { CONST_ROLE_TYPE } from 'src/users/entities/user.entity';

@Controller('lecture')
export class LecturesController {
  constructor(
    private readonly lecturesService: LecturesService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createLecture(
    @Req() req: Request,
    @Body() requestCreateLectureDto: RequestCreateLectureDto,
  ): Promise<ResponseCreateLectureDto | string> {
    const user = await this.usersService.getMe(+req.user);
    if (user.role === CONST_ROLE_TYPE.ADMIN) {
    } else if (user.role === CONST_ROLE_TYPE.TEACHER) {
    } else {
      return '잘못된 접근입니다';
    }
    return await this.lecturesService.createLecture(requestCreateLectureDto);
  }

  @Get()
  async readLectures() {
    const lectures = await this.lecturesService.findAll();
    const filteredLectures = [];
    await Promise.all(
      lectures.map(async (lecture) => {
        const teacher = await this.usersService.findNameById(lecture.teacherId);
        filteredLectures.push({
          title: lecture.title,
          thumbnail: lecture.thumbnail,
          teacherName: teacher.nickname,
        });
      }),
    );
    return filteredLectures;
  }
}
