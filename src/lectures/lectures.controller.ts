import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RequestCreateLectureDto } from './dtos/request/requestCreateLecture.dto';
import { ResponseCreateLectureDto } from './dtos/response/responseCreateLecture.dto';
import { LecturesService } from './lectures.service';
import { Request } from 'express';
import { RATING_TYPE } from './entities/lectureReview.entity';

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

  @Get('/guest/video/:lectureId')
  async readLectureVideoByIdGuest(@Param() param: { lectureId: string }) {
    return await this.lecturesService.readLectureVideoByIdGuest(param);
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

  @Put('/:lectureId')
  @UseGuards(JwtAuthGuard)
  async registerLecture(
    @Param() param: { lectureId: string },
    @Req() req: Request,
  ) {
    return await this.lecturesService.registerLecture(param, req);
  }

  @Put('/admin/:lectureId')
  @UseGuards(JwtAuthGuard)
  async approveLecture(
    @Param() pathParam: { lectureId: string },
    @Req() req: Request,
    @Query() queryParam: { userId: string },
  ) {
    return await this.lecturesService.approveLecture(
      pathParam,
      req,
      queryParam,
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

  @Post('/tag/create')
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

  @Put('/tag/:lectureId')
  @UseGuards(JwtAuthGuard)
  async registerTag(
    @Req() req: Request,
    @Param() pathParam: { lectureId: string },
    @Query() queryParam: { ids: string[] },
  ) {
    return await this.lecturesService.registerTag(req, pathParam, queryParam);
  }

  @Post('/notice/create/:lectureId')
  @UseGuards(JwtAuthGuard)
  async createNotice(
    @Param() param: { lectureId: string },
    @Req() req: Request,
    @Body() requestCreateNoticeDto: { title: string; description: string },
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
    return await this.lecturesService.createNotice(
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
    return await this.lecturesService.createNotice(
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
