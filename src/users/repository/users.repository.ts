import { EntityRepository, Repository } from 'typeorm';
import { CONST_ROLE_TYPE, ROLE_TYPE, User } from '../entity/user.entity';
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus } from '@nestjs/common';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  getMe(user: User) {
    return user
      ? {
          userId: user.id,
          role: user.role,
          nickname: user.nickname,
        }
      : { userId: null, role: null, nickname: null };
  }

  async getMyInfo(user: User) {
    const student = await this.findOne({
      where: { id: +user.id },
      select: ['id', 'email', 'nickname', 'phone'],
    });
    if (!student) {
      throw new HttpException(
        '해당 유저가 존재하지 않습니다!',
        HttpStatus.NOT_FOUND,
      );
    }
    return student;
  }

  async findAllUsers(user: User) {
    const users = await this.find({
      select: ['id', 'email', 'nickname', 'phone', 'role'],
    });
    if (users.length === 0) {
      return null;
    }
    return users;
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
    if (
      typeof user.role === typeof CONST_ROLE_TYPE &&
      user.role !== CONST_ROLE_TYPE.ADMIN
    ) {
      throw new HttpException('관리자 권한이 없습니다!', HttpStatus.FORBIDDEN);
    }
    if (
      typeof user.role === typeof CONST_ROLE_TYPE &&
      user.role !== CONST_ROLE_TYPE.STUDENT
    ) {
      if (user.id !== +param.userId) {
        throw new HttpException(
          '회원 정보를 수정할 권한이 없습니다!',
          HttpStatus.FORBIDDEN,
        );
      }
    }
    const existUpdateUser = await this.findOne({
      where: {
        id: +param.userId,
      },
    });
    if (!existUpdateUser) {
      throw new HttpException('잘못된 요청입니다!', HttpStatus.BAD_REQUEST);
    }
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
    return await this.save(existUpdateUser);
  }

  async deleteUser(param: { userId: string }, user: User) {
    if (
      typeof user.role === typeof CONST_ROLE_TYPE &&
      user.role !== CONST_ROLE_TYPE.ADMIN
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
