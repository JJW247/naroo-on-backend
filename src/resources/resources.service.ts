import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource, RESOURCE_TYPE } from './entities/resource.entity';
import { Request } from 'express';
import { CONST_ROLE_TYPE, User } from 'src/users/entities/user.entity';

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
      content_id: number;
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
      content_id: requestCreateResourceContentDto.content_id,
      content: requestCreateResourceContentDto.content,
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
}
