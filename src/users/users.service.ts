import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CONST_ROLE_TYPE, ROLE_TYPE, User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dtos/signUp.dto';
import { SignInDto } from './dtos/signIn.dto';
import { AddTeacherDto } from './dtos/addTeacher.dto';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

  async getMe(req: Request) {
    const user = await this.usersRepository.findOne({
      where: {
        id: +req.user,
      },
      select: ['id', 'role', 'nickname'],
    });
    return user
      ? { userId: user.id, role: user.role, nickname: user.nickname }
      : { userId: null, role: null, nickname: null };
  }

  async addTeacher(req: Request, addTeacherDto: AddTeacherDto) {
    const hashedPassword = await bcrypt.hash(addTeacherDto.password, 10);

    const user = await this.usersRepository.findOne({
      where: {
        id: +req.user,
      },
      select: ['role'],
    });

    if (user.role === CONST_ROLE_TYPE.ADMIN) {
      return await this.usersRepository.save({
        email: addTeacherDto.email,
        nickname: addTeacherDto.nickname,
        password: hashedPassword,
        phone: addTeacherDto.phone,
        role: CONST_ROLE_TYPE.TEACHER,
        introduce: addTeacherDto.introduce,
      });
    } else {
      return null;
    }
  }

  async findAllTeachers(req: Request) {
    const user = await this.usersRepository.findOne({
      where: {
        id: +req.user,
      },
      select: ['role'],
    });

    if (user.role === CONST_ROLE_TYPE.ADMIN) {
      const teachers = await this.usersRepository.find({
        where: {
          role: CONST_ROLE_TYPE.TEACHER,
        },
        select: ['id', 'email', 'nickname', 'phone', 'introduce'],
      });
      if (teachers.length === 0) {
        return null;
      }
      return teachers;
    } else {
      return null;
    }
  }

  async findAllStudents(req: Request) {
    const user = await this.usersRepository.findOne({
      where: {
        id: +req.user,
      },
      select: ['role'],
    });

    if (user.role === CONST_ROLE_TYPE.ADMIN) {
      const students = await this.usersRepository.find({
        where: {
          role: CONST_ROLE_TYPE.STUDENT,
        },
        select: ['id', 'email', 'nickname', 'phone'],
      });
      if (students.length === 0) {
        return null;
      }
      return students;
    } else {
      return null;
    }
  }

  async updateUserInfo(
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
    const user = await this.usersRepository.findOne({
      where: {
        id: +req.user,
      },
      select: ['role'],
    });
    if (
      typeof user.role === typeof CONST_ROLE_TYPE &&
      user.role !== CONST_ROLE_TYPE.ADMIN
    ) {
      throw new HttpException('관리자 권한이 없습니다!', HttpStatus.FORBIDDEN);
    }
    const existUser = await this.usersRepository.findOne({
      where: {
        id: +param.userId,
      },
    });
    existUser.email = updateUserInfoDto.email
      ? updateUserInfoDto.email
      : existUser.email;
    existUser.nickname = updateUserInfoDto.nickname
      ? updateUserInfoDto.nickname
      : existUser.nickname;
    existUser.password = updateUserInfoDto.password
      ? await bcrypt.hash(updateUserInfoDto.password, 10)
      : existUser.password;
    existUser.phone = updateUserInfoDto.phone
      ? updateUserInfoDto.phone
      : existUser.phone;
    existUser.role = updateUserInfoDto.role
      ? updateUserInfoDto.role
      : existUser.role;
    existUser.introduce = updateUserInfoDto.introduce
      ? updateUserInfoDto.introduce
      : existUser.introduce;
    return await this.usersRepository.save(existUser);
  }

  async deleteUser(param: { userId: string }, req: Request) {
    const user = await this.usersRepository.findOne({
      where: {
        id: +req.user,
      },
      select: ['role'],
    });
    if (
      typeof user.role === typeof CONST_ROLE_TYPE &&
      user.role !== CONST_ROLE_TYPE.ADMIN
    ) {
      throw new HttpException('관리자 권한이 없습니다!', HttpStatus.FORBIDDEN);
    }
    const existUser = await this.usersRepository.findOne({
      where: {
        id: +param.userId,
      },
    });
    const result = await this.usersRepository.delete({ id: existUser.id });
    return result.affected === 1 ? { ok: true } : { ok: false };
  }
}
