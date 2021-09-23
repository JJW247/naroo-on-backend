import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource, RESOURCE_TYPE } from './entity/resource.entity';
import { Request } from 'express';
import { CONST_ROLE_TYPE, User } from '../users/entity/user.entity';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourcesRepository: Repository<Resource>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async createResourceContent(
    req: Request,
    requestCreateResourceContentDto: {
      type: RESOURCE_TYPE;
      content: string;
    },
  ) {
    const user = await this.usersRepository.findOne({
      where: {
        id: req.user,
      },
      select: ['role'],
    });
    if (
      typeof user.role === typeof CONST_ROLE_TYPE &&
      user.role !== CONST_ROLE_TYPE.ADMIN
    ) {
      throw new HttpException('관리자 권한이 없습니다!', HttpStatus.FORBIDDEN);
    }
    return await this.resourcesRepository.save({
      type: requestCreateResourceContentDto.type,
      content: requestCreateResourceContentDto.content,
    });
  }

  async updateResourceContent(
    req: Request,
    requestUpdateResourceContentDto: {
      type: RESOURCE_TYPE;
      content_id: string;
      content: string;
    },
  ) {
    const user = await this.usersRepository.findOne({
      where: {
        id: req.user,
      },
      select: ['role'],
    });
    if (
      typeof user.role === typeof CONST_ROLE_TYPE &&
      user.role !== CONST_ROLE_TYPE.ADMIN
    ) {
      throw new HttpException('관리자 권한이 없습니다!', HttpStatus.FORBIDDEN);
    }
    const resource = await this.resourcesRepository.findOne({
      where: {
        type: requestUpdateResourceContentDto.type,
        content_id: +requestUpdateResourceContentDto.content_id,
      },
    });
    if (!resource) {
      throw new HttpException(
        '존재하지 않는 리소스입니다!',
        HttpStatus.BAD_REQUEST,
      );
    }
    resource.content = requestUpdateResourceContentDto.content;
    return await this.resourcesRepository.save(resource);
  }

  async getAllResources(req: Request) {
    const user = await this.usersRepository.findOne({
      where: {
        id: req.user,
      },
      select: ['role'],
    });
    if (
      typeof user.role === typeof CONST_ROLE_TYPE &&
      user.role !== CONST_ROLE_TYPE.ADMIN
    ) {
      throw new HttpException('관리자 권한이 없습니다!', HttpStatus.FORBIDDEN);
    }
    return await this.resourcesRepository.find({
      select: ['type', 'content_id', 'content'],
      order: {
        type: 'ASC',
        content_id: 'ASC',
      },
    });
  }

  async getResourceContent(param: { type: string }) {
    return await this.resourcesRepository.find({
      where: {
        type: param.type,
      },
      select: ['content'],
    });
  }

  async deleteResource(
    pathParam: { content_id: string },
    queryParam: { type: string },
    req: Request,
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
    if (+pathParam.content_id === 0) {
      throw new HttpException(
        '기본 리소스는 삭제할 수 없습니다!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const resource = await this.resourcesRepository.findOne({
      where: {
        type: queryParam.type,
        content_id: +pathParam.content_id,
      },
    });
    const result = await this.resourcesRepository.delete(resource);
    return result.affected === 1 ? { ok: true } : { ok: false };
  }
}
