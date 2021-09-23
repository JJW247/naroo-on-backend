import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ROLE_TYPE } from './entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signUp.dto';
import { SignInDto } from './dto/signIn.dto';
import { AddTeacherDto } from './dto/addTeacher.dto';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { UsersRepository } from './repository/users.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);

    if (!signUpDto.phone.match(/^[0-9]{3}[-]+[0-9]{4}[-]+[0-9]{4}$/)) {
      throw new HttpException(
        '휴대폰 번호를 정확하게 입력해주세요!',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isUniquePhone = await this.usersRepository.findOne({
      phone: signUpDto.phone,
    });

    if (isUniquePhone !== undefined) {
      throw new HttpException(
        '동일한 휴대폰 번호가 존재합니다!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const verifyToken: number =
      Math.floor(Math.random() * (9999999999 - 1111111111 + 1)) + 1111111111;

    const user = await this.usersRepository.save({
      email: signUpDto.email,
      nickname: signUpDto.nickname,
      password: hashedPassword,
      phone: signUpDto.phone,
      isAgreeEmail: signUpDto.isAgreeEmail === 'true' ? true : false,
      isAuthorized: false,
      verifyToken: verifyToken.toString(),
    });

    await this.authService.sendVerifyEmail(user);

    return user;
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.usersRepository.findOne({
      where: {
        email: signInDto.email,
      },
      select: ['id', 'email', 'password', 'isAuthorized', 'verifyToken'],
    });

    if (!user) {
      throw new HttpException(
        '존재하지 않는 유저입니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.isAuthorized) {
      await this.authService.sendVerifyEmail(user);
      throw new HttpException(
        '이메일 인증 메일을 재전송하였습니다. 이메일 인증을 완료해주세요!',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const checkPassword = await bcrypt.compare(
      signInDto.password,
      user.password,
    );

    if (!checkPassword) {
      throw new HttpException(
        '비밀번호가 일치하지 않습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = this.jwtService.sign({ id: user.id });

    return { token };
  }

  getMe(req: Request) {
    return this.usersRepository.getMe(req);
  }

  addTeacher(req: Request, addTeacherDto: AddTeacherDto) {
    return this.usersRepository.addTeacher(req, addTeacherDto);
  }

  findAllTeachers(req: Request) {
    return this.usersRepository.findAllTeachers(req);
  }

  findAllStudents(req: Request) {
    return this.usersRepository.findAllStudents(req);
  }

  updateUserInfo(
    param: { userId: string },
    req: Request,
    updateUserInfoDto: {
      email: string | null;
      nickname: string | null;
      password: string | null;
      phone: string | null;
      role: ROLE_TYPE | null;
      introduce: string | null;
    },
  ) {
    return this.usersRepository.updateUserInfo(param, req, updateUserInfoDto);
  }

  deleteUser(param: { userId: string }, req: Request) {
    return this.usersRepository.deleteUser(param, req);
  }
}
