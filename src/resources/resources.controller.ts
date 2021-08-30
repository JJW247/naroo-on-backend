import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ResourcesService } from './resources.service';
import { Request } from 'express';
import { RESOURCE_TYPE } from './entities/resource.entity';

@Controller('resource')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createResourceContent(
    @Req() req: Request,
    @Body()
    requestCreateResourceContentDto: {
      type: RESOURCE_TYPE;
      content_id: number;
      content: string;
    },
  ) {
    return await this.resourcesService.createResourceContent(
      req,
      requestCreateResourceContentDto,
    );
  }

  @Get('/:type')
  async getResourceContent(@Param() param: { type: string }) {
    return await this.resourcesService.getResourceContent(param);
  }
}
