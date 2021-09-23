import { EntityRepository, Repository } from 'typeorm';
import { CONST_ROLE_TYPE, ROLE_TYPE, User } from '../entity/user.entity';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { AddTeacherDto } from '../dto/addTeacher.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async getMe(req: Request) {
    const user = await this.findOne({
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

    const user = await this.findOne({
      where: {
        id: +req.user,
      },
      select: ['role'],
    });

    if (user.role === CONST_ROLE_TYPE.ADMIN) {
      return await this.save({
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
    const user = await this.findOne({
      where: {
        id: +req.user,
      },
      select: ['role'],
    });

    if (user.role === CONST_ROLE_TYPE.ADMIN) {
      const teachers = await this.find({
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
    const user = await this.findOne({
      where: {
        id: +req.user,
      },
      select: ['role'],
    });

    if (user.role === CONST_ROLE_TYPE.ADMIN) {
      const students = await this.find({
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
    const user = await this.findOne({
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
    const existUser = await this.findOne({
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
    return await this.save(existUser);
  }

  async deleteUser(param: { userId: string }, req: Request) {
    const user = await this.findOne({
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
    const existUser = await this.findOne({
      where: {
        id: +param.userId,
      },
    });
    const result = await this.delete({ id: existUser.id });
    return result.affected === 1 ? { ok: true } : { ok: false };
  }
}
