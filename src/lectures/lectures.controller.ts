import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../users/guard/jwt.guard';
import { RequestCreateLectureDto } from './dto/request/requestCreateLecture.dto';
import { ResponseCreateLectureDto } from './dto/response/responseCreateLecture.dto';
import { LecturesService } from './lectures.service';
import { RATING_TYPE } from './entity/lectureReview.entity';
import { LECTURE_STATUS } from './entity/studentLecture.entity';
import { LECTURE_TYPE } from './entity/lecture.entity';
import { GetUser } from 'src/users/decorator/get-user.decorator';
import { User } from 'src/users/entity/user.entity';
import { AdminUserGuard } from 'src/users/guard/admin-user.guard';
import { StudentUserGuard } from 'src/users/guard/student-user.guard';

@Controller('lecture')
export class LecturesController {
  constructor(private readonly lecturesService: LecturesService) {}

  @Post('/create')
  @UseGuards(AdminUserGuard)
  createLecture(
    @Body() requestCreateLectureDto: RequestCreateLectureDto,
  ): Promise<ResponseCreateLectureDto | string> {
    return this.lecturesService.createLecture(requestCreateLectureDto);
  }

  @Put('/admin/:lectureId')
  @UseGuards(AdminUserGuard)
  updateLectureInfo(
    @Param() param: { lectureId: string },
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
    return this.lecturesService.updateLectureInfo(param, updateLectureInfoDto);
  }

  @Delete('/admin/:lectureId')
  @UseGuards(AdminUserGuard)
  deleteLecture(@Param() param: { lectureId: string }) {
    return this.lecturesService.deleteLecture(param);
  }

  @Get('/all')
  readAllLectures() {
    return this.lecturesService.readAllLectures();
  }

  @Get('/guest/:lectureId')
  readLectureByIdGuest(@Param() param: { lectureId: string }) {
    return this.lecturesService.readLectureByIdGuest(param);
  }

  @Get('/:lectureId')
  @UseGuards(JwtAuthGuard)
  readLectureById(
    @GetUser() user: User,
    @Param() param: { lectureId: string },
  ) {
    return this.lecturesService.readLectureById(user, param);
  }

  @Get('/video/:lectureId')
  @UseGuards(JwtAuthGuard)
  readLectureVideoById(
    @GetUser() user: User,
    @Param() param: { lectureId: string },
  ) {
    return this.lecturesService.readLectureVideoById(user, param);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  readLectures(@GetUser() user: User) {
    return this.lecturesService.readLectures(user);
  }

  @Get('/admin/status')
  @UseGuards(AdminUserGuard)
  readLectureStatuses() {
    return this.lecturesService.readLectureStatuses();
  }

  @Put('/:lectureId')
  @UseGuards(StudentUserGuard)
  registerLecture(
    @Param() param: { lectureId: string },
    @GetUser() user: User,
  ) {
    return this.lecturesService.registerLecture(param, user);
  }

  @Put('/admin/status/:lectureId')
  @UseGuards(AdminUserGuard)
  updateLectureStatus(
    @Param() pathParam: { lectureId: string },
    @Query() queryParam: { userId: string },
    @Body() requestUpdateLectureStatus: { status: LECTURE_STATUS },
  ) {
    return this.lecturesService.updateLectureStatus(
      pathParam,
      queryParam,
      requestUpdateLectureStatus,
    );
  }

  @Put('/review/:lectureId')
  @UseGuards(StudentUserGuard)
  registerReview(
    @Param() param: { lectureId: string },
    @GetUser() user: User,
    @Body() requestRegisterReviewDto: { review: string; rating: RATING_TYPE },
  ) {
    return this.lecturesService.registerReview(
      param,
      user,
      requestRegisterReviewDto,
    );
  }

  @Get('/review/recent')
  readRecentReviews() {
    return this.lecturesService.readRecentReviews();
  }

  @Post('/admin/tag/create')
  @UseGuards(AdminUserGuard)
  createTag(@Body() requestCreateTagDto: { name: string }) {
    return this.lecturesService.createTag(requestCreateTagDto);
  }

  @Get('/admin/tag')
  @UseGuards(AdminUserGuard)
  readAllTags() {
    return this.lecturesService.readAllTags();
  }

  @Get('/tag/:lectureId')
  readTags(@Param() param: { lectureId: string }) {
    return this.lecturesService.readTags(param);
  }

  @Put('/admin/tag/:tagId')
  @UseGuards(AdminUserGuard)
  updateTag(
    @Param() param: { tagId: string },
    @Body() updateTagDto: { tagName: string },
  ) {
    return this.lecturesService.updateTag(param, updateTagDto);
  }

  @Delete('/admin/tag/:tagId')
  @UseGuards(AdminUserGuard)
  deleteTag(@Param() param: { tagId: string }) {
    return this.lecturesService.deleteTag(param);
  }

  @Put('/admin/tag/register/:lectureId')
  @UseGuards(AdminUserGuard)
  registerTag(
    @Param() pathParam: { lectureId: string },
    @Body() registerTagDto: { ids: string[] },
  ) {
    return this.lecturesService.registerTag(pathParam, registerTagDto);
  }

  @Delete('/admin/tag/unregister/:lectureId')
  @UseGuards(AdminUserGuard)
  unregisterTag(
    @Param() pathParam: { lectureId: string },
    @Query() unregisterTagDto: { id: string },
  ) {
    return this.lecturesService.unregisterTag(pathParam, unregisterTagDto);
  }

  @Put('/admin/notice/:lectureId')
  @UseGuards(AdminUserGuard)
  createNotice(
    @Param() param: { lectureId: string },
    @GetUser() user: User,
    @Body()
    requestCreateNoticeDto: {
      title: string;
      description: string;
    },
  ) {
    return this.lecturesService.createNotice(
      param,
      user,
      requestCreateNoticeDto,
    );
  }

  @Get('/notice/:lectureId')
  readNotices(@Param() param: { lectureId: string }) {
    return this.lecturesService.readNotices(param);
  }

  @Post('/question/:lectureId')
  @UseGuards(StudentUserGuard)
  createQuestion(
    @Param() param: { lectureId: string },
    @GetUser() user: User,
    @Body() requestCreateQuestionDto: { title: string; description: string },
  ) {
    return this.lecturesService.createQuestion(
      param,
      user,
      requestCreateQuestionDto,
    );
  }

  @Post('/admin/answer/:lectureId')
  @UseGuards(AdminUserGuard)
  createAnswer(
    @Param() param: { lectureId: string },
    @GetUser() user: User,
    @Body() requestCreateAnswerDto: { title: string; description: string },
  ) {
    return this.lecturesService.createAnswer(
      param,
      user,
      requestCreateAnswerDto,
    );
  }

  @Get('/lecture/question/:lectureId')
  readQnas(@Param() param: { lectureId: string }) {
    return this.lecturesService.readQnas(param);
  }
}
