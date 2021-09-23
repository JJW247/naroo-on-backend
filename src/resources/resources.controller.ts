import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ResourcesService } from './resources.service';
import { Request } from 'express';
import { RESOURCE_TYPE } from './entity/resource.entity';

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
      content: string;
    },
  ) {
    return await this.resourcesService.createResourceContent(
      req,
      requestCreateResourceContentDto,
    );
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async updateResourceContent(
    @Req() req: Request,
    @Body()
    requestUpdateResourceContentDto: {
      type: RESOURCE_TYPE;
      content_id: string;
      content: string;
    },
  ) {
    return await this.resourcesService.updateResourceContent(
      req,
      requestUpdateResourceContentDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllResources(@Req() req: Request) {
    return await this.resourcesService.getAllResources(req);
  }

  @Get('/:type')
  async getResourceContent(@Param() param: { type: string }) {
    return await this.resourcesService.getResourceContent(param);
  }

  @Delete('/:content_id')
  @UseGuards(JwtAuthGuard)
  async deleteResource(
    @Param() pathParam: { content_id: string },
    @Query() queryParam: { type: string },
    @Req() req: Request,
  ) {
    return await this.resourcesService.deleteResource(
      pathParam,
      queryParam,
      req,
    );
  }
}
