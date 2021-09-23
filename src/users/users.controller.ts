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
import { JwtAuthGuard } from '../users/guards/jwt.guard';
import { UsersService } from './users.service';
import { Request } from 'express';
import { AddTeacherDto } from './dto/addTeacher.dto';
import { ROLE_TYPE, User } from './entity/user.entity';
import { SignUpDto } from './dto/signUp.dto';
import { SignInDto } from './dto/signIn.dto';
import { GetUser } from './decorator/get-user.decorator';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.usersService.signUp(signUpDto);
  }

  @Post('/signin')
  signIn(@Body() signInDto: SignInDto) {
    return this.usersService.signIn(signInDto);
  }

  @Get('verify')
  verifyCode(@Query() param: { requestToken: string }) {
    return this.usersService.verifyCode(param);
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  getMe(@GetUser() user: User) {
    return this.usersService.getMe(user);
  }

  @Post('/admin/teacher')
  @UseGuards(JwtAuthGuard)
  addTeacher(@GetUser() user: User, @Body() addTeacherDto: AddTeacherDto) {
    return this.usersService.addTeacher(user, addTeacherDto);
  }

  @Get('/admin/teacher')
  @UseGuards(JwtAuthGuard)
  findAllTeachers(@GetUser() user: User) {
    return this.usersService.findAllTeachers(user);
  }

  @Get('/admin/student')
  @UseGuards(JwtAuthGuard)
  findAllStudents(@GetUser() user: User) {
    return this.usersService.findAllStudents(user);
  }

  @Put('/admin/:userId')
  @UseGuards(JwtAuthGuard)
  updateUserInfo(
    @Param() param: { userId: string },
    @GetUser() user: User,
    @Body()
    updateUserInfoDto: {
      email: string | null;
      nickname: string | null;
      password: string | null;
      phone: string | null;
      role: ROLE_TYPE | null;
      introduce: string | null;
    },
  ) {
    return this.usersService.updateUserInfo(param, user, updateUserInfoDto);
  }

  @Delete('/admin/:userId')
  @UseGuards(JwtAuthGuard)
  deleteUser(@Param() param: { userId: string }, @GetUser() user: User) {
    return this.usersService.deleteUser(param, user);
  }
}
