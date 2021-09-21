import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RequestCreateLectureDto } from './dto/request/requestCreateLecture.dto';
import { ResponseCreateLectureDto } from './dto/response/responseCreateLecture.dto';
import { LecturesService } from './lectures.service';
import { Request } from 'express';
import { RATING_TYPE } from './entities/lectureReview.entity';
import { LECTURE_STATUS } from './entities/studentLecture.entity';
import { LECTURE_TYPE } from './entities/lecture.entity';

@Controller('lecture')
export class LecturesController {
  constructor(private readonly lecturesService: LecturesService) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createLecture(
    @Req() req: Request,
    @Body() requestCreateLectureDto: RequestCreateLectureDto,
  ): Promise<ResponseCreateLectureDto | string> {
    console.log(requestCreateLectureDto);
    return await this.lecturesService.createLecture(
      req,
      requestCreateLectureDto,
    );
  }

  @Put('/admin/:lectureId')
  @UseGuards(JwtAuthGuard)
  async updateLectureInfo(
    @Param() param: { lectureId: string },
    @Req() req: Request,
    @Body()
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
    return await this.lecturesService.updateLectureInfo(
      param,
      req,
      updateLectureInfoDto,
    );
  }

  @Delete('/admin/:lectureId')
  @UseGuards(JwtAuthGuard)
  async deleteLecture(
    @Param() param: { lectureId: string },
    @Req() req: Request,
  ) {
    return await this.lecturesService.deleteLecture(param, req);
  }

  @Get('/all')
  async readAllLectures() {
    return await this.lecturesService.readAllLectures();
  }

  @Get('/guest/:lectureId')
  async readLectureByIdGuest(@Param() param: { lectureId: string }) {
    return await this.lecturesService.readLectureByIdGuest(param);
  }

  @Get('/:lectureId')
  @UseGuards(JwtAuthGuard)
  async readLectureById(
    @Req() req: Request,
    @Param() param: { lectureId: string },
  ) {
    return await this.lecturesService.readLectureById(req, param);
  }

  @Get('/video/:lectureId')
  @UseGuards(JwtAuthGuard)
  async readLectureVideoById(
    @Req() req: Request,
    @Param() param: { lectureId: string },
  ) {
    return await this.lecturesService.readLectureVideoById(req, param);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async readLectures(@Req() req: Request) {
    return await this.lecturesService.readLectures(req);
  }

  @Get('/admin/status')
  @UseGuards(JwtAuthGuard)
  async readLectureStatuses(@Req() req: Request) {
    return await this.lecturesService.readLectureStatuses(req);
  }

  @Put('/:lectureId')
  @UseGuards(JwtAuthGuard)
  async registerLecture(
    @Param() param: { lectureId: string },
    @Req() req: Request,
  ) {
    return await this.lecturesService.registerLecture(param, req);
  }

  @Put('/admin/status/:lectureId')
  @UseGuards(JwtAuthGuard)
  async updateLectureStatus(
    @Param() pathParam: { lectureId: string },
    @Req() req: Request,
    @Query() queryParam: { userId: string },
    @Body() requestUpdateLectureStatus: { status: LECTURE_STATUS },
  ) {
    return await this.lecturesService.updateLectureStatus(
      pathParam,
      req,
      queryParam,
      requestUpdateLectureStatus,
    );
  }

  @Put('/review/:lectureId')
  @UseGuards(JwtAuthGuard)
  async registerReview(
    @Param() param: { lectureId: string },
    @Req() req: Request,
    @Body() requestRegisterReviewDto: { review: string; rating: RATING_TYPE },
  ) {
    return await this.lecturesService.registerReview(
      param,
      req,
      requestRegisterReviewDto,
    );
  }

  @Get('/review/recent')
  async readRecentReviews() {
    return await this.lecturesService.readRecentReviews();
  }

  @Post('/admin/tag/create')
  @UseGuards(JwtAuthGuard)
  async createTag(
    @Req() req: Request,
    @Body() requestCreateTagDto: { name: string },
  ) {
    return await this.lecturesService.createTag(req, requestCreateTagDto);
  }

  @Get('/admin/tag')
  @UseGuards(JwtAuthGuard)
  async readAllTags(@Req() req: Request) {
    return await this.lecturesService.readAllTags(req);
  }

  @Get('/tag/:lectureId')
  async readTags(@Param() param: { lectureId: string }) {
    return await this.lecturesService.readTags(param);
  }

  @Put('/admin/tag/:tagId')
  @UseGuards(JwtAuthGuard)
  async updateTag(
    @Param() param: { tagId: string },
    @Req() req: Request,
    @Body() updateTagDto: { tagName: string },
  ) {
    return await this.lecturesService.updateTag(param, req, updateTagDto);
  }

  @Delete('/admin/tag/:tagId')
  @UseGuards(JwtAuthGuard)
  async deleteTag(@Param() param: { tagId: string }, @Req() req: Request) {
    return await this.lecturesService.deleteTag(param, req);
  }

  @Put('/tag/:lectureId')
  @UseGuards(JwtAuthGuard)
  async registerTag(
    @Req() req: Request,
    @Param() pathParam: { lectureId: string },
    @Body() registerTagDto: { ids: string[] },
  ) {
    return await this.lecturesService.registerTag(
      req,
      pathParam,
      registerTagDto,
    );
  }

  @Delete('/tag/:lectureId')
  @UseGuards(JwtAuthGuard)
  async unregisterTag(
    @Req() req: Request,
    @Param() pathParam: { lectureId: string },
    @Query() unregisterTagDto: { id: string },
  ) {
    return await this.lecturesService.unregisterTag(
      req,
      pathParam,
      unregisterTagDto,
    );
  }

  @Put('/notice/:lectureId')
  @UseGuards(JwtAuthGuard)
  async createNotice(
    @Param() param: { lectureId: string },
    @Req() req: Request,
    @Body()
    requestCreateNoticeDto: {
      title: string;
      description: string;
    },
  ) {
    return await this.lecturesService.createNotice(
      param,
      req,
      requestCreateNoticeDto,
    );
  }

  @Get('/notice/:lectureId')
  async readNotices(@Param() param: { lectureId: string }) {
    return await this.lecturesService.readNotices(param);
  }

  @Post('/lecture/question/:lectureId')
  @UseGuards(JwtAuthGuard)
  async createQuestion(
    @Param() param: { lectureId: string },
    @Req() req: Request,
    @Body() requestCreateQuestionDto: { title: string; description: string },
  ) {
    return await this.lecturesService.createQuestion(
      param,
      req,
      requestCreateQuestionDto,
    );
  }

  @Post('/lecture/answer/:lectureId')
  @UseGuards(JwtAuthGuard)
  async createAnswer(
    @Param() param: { lectureId: string },
    @Req() req: Request,
    @Body() requestCreateAnswerDto: { title: string; description: string },
  ) {
    return await this.lecturesService.createAnswer(
      param,
      req,
      requestCreateAnswerDto,
    );
  }

  @Get('/lecture/question/:lectureId')
  async readQnas(@Param() param: { lectureId: string }) {
    return await this.lecturesService.readQnas(param);
  }
}
