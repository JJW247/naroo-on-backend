import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CONST_ROLE_TYPE, User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dtos/signup.dto';
import { SignInDto } from './dtos/signIn.dto';
import { AddTeacherDto } from './dtos/addTeacher.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);

    if (!signUpDto.phone.match(/^[0-9]{3}[-]+[0-9]{4}[-]+[0-9]{4}$/)) {
      throw new HttpException(
        '휴대폰 번호를 정확하게 입력해주세요!',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const user = await this.usersRepository.save({
      email: signUpDto.email,
      nickname: signUpDto.nickname,
      password: hashedPassword,
      phone: signUpDto.phone,
    });

    const token = this.jwtService.sign({ id: user.id });

    return {
      token,
    };
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.usersRepository.findOne({
      where: {
        email: signInDto.email,
      },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new HttpException(
        '존재하지 않는 유저입니다.',
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

  getMe(id: number) {
    if (!id) {
      return null;
    }
    return this.usersRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'role'],
    });
  }

  findNameById(id: number) {
    if (!id) {
      return null;
    }
    return this.usersRepository.findOne({
      where: {
        id,
      },
      select: ['nickname'],
    });
  }

  async addTeacher(id: number, addTeacherDto: AddTeacherDto) {
    if (!id) {
      return null;
    }

    const user = await this.usersRepository.findOne({
      where: {
        id,
      },
      select: ['role'],
    });

    if (user.role === CONST_ROLE_TYPE.ADMIN) {
      return await this.usersRepository.save({
        email: addTeacherDto.email,
        nickname: addTeacherDto.nickname,
        password: addTeacherDto.password,
        phone: addTeacherDto.phone,
        role: CONST_ROLE_TYPE.TEACHER,
        introduce: addTeacherDto.introduce,
      });
    } else {
      return null;
    }
  }

  async findAllTeachers(id: number) {
    if (!id) {
      return null;
    }

    const user = await this.usersRepository.findOne({
      where: {
        id,
      },
      select: ['role'],
    });

    if (user.role === CONST_ROLE_TYPE.ADMIN) {
      const teachers = await this.usersRepository.find({
        where: {
          role: CONST_ROLE_TYPE.TEACHER,
        },
        select: ['nickname', 'introduce'],
      });
      if (teachers.length === 0) {
        return null;
      }
      return teachers;
    } else {
      return null;
    }
  }

  async findAllStudents(id: number) {
    if (!id) {
      return null;
    }

    const user = await this.usersRepository.findOne({
      where: {
        id,
      },
      select: ['role'],
    });

    if (user.role === CONST_ROLE_TYPE.ADMIN) {
      const students = await this.usersRepository.find({
        where: {
          role: CONST_ROLE_TYPE.STUDENT,
        },
        select: ['email', 'nickname'],
      });
      if (students.length === 0) {
        return null;
      }
      return students;
    } else {
      return null;
    }
  }
}
