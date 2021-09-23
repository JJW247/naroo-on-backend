import { EntityRepository, Repository } from 'typeorm';
import { CONST_ROLE_TYPE, ROLE_TYPE, User } from '../entity/user.entity';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AddTeacherDto } from '../dto/addTeacher.dto';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async getMe(user: User) {
    const existUser = await this.findOne({
      where: {
        user,
      },
      select: ['id', 'role', 'nickname'],
    });
    return existUser
      ? {
          userId: existUser.id,
          role: existUser.role,
          nickname: existUser.nickname,
        }
      : { userId: null, role: null, nickname: null };
  }

  async addTeacher(user: User, addTeacherDto: AddTeacherDto) {
    const hashedPassword = await bcrypt.hash(addTeacherDto.password, 10);

    const existUser = await this.findOne({
      where: {
        user,
      },
      select: ['role'],
    });

    if (existUser.role === CONST_ROLE_TYPE.ADMIN) {
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

  async findAllTeachers(user: User) {
    const existUser = await this.findOne({
      where: {
        user,
      },
      select: ['role'],
    });

    if (existUser.role === CONST_ROLE_TYPE.ADMIN) {
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

  async findAllStudents(user: User) {
    const existUser = await this.findOne({
      where: {
        user,
      },
      select: ['role'],
    });

    if (existUser.role === CONST_ROLE_TYPE.ADMIN) {
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
    user: User,
    updateUserInfoDto: {
      email: string | null;
      nickname: string | null;
      password: string | null;
      phone: string | null;
      role: ROLE_TYPE | null;
      introduce: string | null;
    },
  ) {
    const existUser = await this.findOne({
      where: {
        user,
      },
      select: ['role'],
    });
    if (
      typeof existUser.role === typeof CONST_ROLE_TYPE &&
      existUser.role !== CONST_ROLE_TYPE.ADMIN
    ) {
      throw new HttpException('관리자 권한이 없습니다!', HttpStatus.FORBIDDEN);
    }
    const existUpdateUser = await this.findOne({
      where: {
        id: +param.userId,
      },
    });
    existUpdateUser.email = updateUserInfoDto.email
      ? updateUserInfoDto.email
      : existUpdateUser.email;
    existUpdateUser.nickname = updateUserInfoDto.nickname
      ? updateUserInfoDto.nickname
      : existUpdateUser.nickname;
    existUpdateUser.password = updateUserInfoDto.password
      ? await bcrypt.hash(updateUserInfoDto.password, 10)
      : existUpdateUser.password;
    existUpdateUser.phone = updateUserInfoDto.phone
      ? updateUserInfoDto.phone
      : existUpdateUser.phone;
    existUpdateUser.role = updateUserInfoDto.role
      ? updateUserInfoDto.role
      : existUpdateUser.role;
    existUpdateUser.introduce = updateUserInfoDto.introduce
      ? updateUserInfoDto.introduce
      : existUpdateUser.introduce;
    return await this.save(existUpdateUser);
  }

  async deleteUser(param: { userId: string }, user: User) {
    const existUser = await this.findOne({
      where: {
        user,
      },
      select: ['role'],
    });
    if (
      typeof existUser.role === typeof CONST_ROLE_TYPE &&
      existUser.role !== CONST_ROLE_TYPE.ADMIN
    ) {
      throw new HttpException('관리자 권한이 없습니다!', HttpStatus.FORBIDDEN);
    }
    const existDeleteUser = await this.findOne({
      where: {
        id: +param.userId,
      },
    });
    const result = await this.delete({ id: existDeleteUser.id });
    return result.affected === 1 ? { ok: true } : { ok: false };
  }
}
