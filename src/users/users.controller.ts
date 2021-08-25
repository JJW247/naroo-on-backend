import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { SignUpDto } from './dtos/signup.dto';
import { SignInDto } from './dtos/signIn.dto';
import { UsersService } from './users.service';
import { Request } from 'express';
import { AddTeacherDto } from './dtos/addTeacher.dto';

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
  async getMe(@Req() req: Request) {
    const user = await this.usersService.getMe(+req.user);
    return user
      ? { userId: user.id, role: user.role }
      : { userId: null, role: null };
  }

  @Post('/admin/teacher')
  @UseGuards(JwtAuthGuard)
  async addTeacher(@Req() req: Request, @Body() addTeacherDto: AddTeacherDto) {
    return await this.usersService.addTeacher(+req.user, addTeacherDto);
  }

  @Get('/admin/teacher')
  @UseGuards(JwtAuthGuard)
  async findAllTeachers(@Req() req: Request) {
    return await this.usersService.findAllTeachers(+req.user);
  }

  @Get('/admin/student')
  @UseGuards(JwtAuthGuard)
  async findAllStudents(@Req() req: Request) {
    return await this.usersService.findAllStudents(+req.user);
  }
}
