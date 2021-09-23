import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { SignUpDto } from './dto/signUp.dto';
import { SignInDto } from './dto/signIn.dto';
import { UsersService } from './users.service';
import { Request } from 'express';
import { AddTeacherDto } from './dto/addTeacher.dto';
import { ROLE_TYPE } from './entity/user.entity';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.usersService.signUp(signUpDto);
  }

  @Post('/signin')
  async signIn(@Body() signInDto: SignInDto) {
    return await this.usersService.signIn(signInDto);
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request) {
    return this.usersService.getMe(req);
  }

  @Post('/admin/teacher')
  @UseGuards(JwtAuthGuard)
  addTeacher(@Req() req: Request, @Body() addTeacherDto: AddTeacherDto) {
    return this.usersService.addTeacher(req, addTeacherDto);
  }

  @Get('/admin/teacher')
  @UseGuards(JwtAuthGuard)
  findAllTeachers(@Req() req: Request) {
    return this.usersService.findAllTeachers(req);
  }

  @Get('/admin/student')
  @UseGuards(JwtAuthGuard)
  findAllStudents(@Req() req: Request) {
    return this.usersService.findAllStudents(req);
  }

  @Put('/admin/:userId')
  @UseGuards(JwtAuthGuard)
  updateUserInfo(
    @Param() param: { userId: string },
    @Req() req: Request,
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
    return this.usersService.updateUserInfo(param, req, updateUserInfoDto);
  }

  @Delete('/admin/:userId')
  @UseGuards(JwtAuthGuard)
  deleteUser(@Param() param: { userId: string }, @Req() req: Request) {
    return this.usersService.deleteUser(param, req);
  }
}
