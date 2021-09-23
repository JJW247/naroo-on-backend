import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../users/guards/jwt.guard';
import { ResourcesService } from './resources.service';
import { RESOURCE_TYPE } from './entity/resource.entity';
import { GetUser } from 'src/users/decorator/get-user.decorator';
import { User } from 'src/users/entity/user.entity';

@Controller('resource')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createResourceContent(
    @GetUser() user: User,
    @Body()
    requestCreateResourceContentDto: {
      type: RESOURCE_TYPE;
      content: string;
    },
  ) {
    return await this.resourcesService.createResourceContent(
      user,
      requestCreateResourceContentDto,
    );
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async updateResourceContent(
    @GetUser() user: User,
    @Body()
    requestUpdateResourceContentDto: {
      type: RESOURCE_TYPE;
      content_id: string;
      content: string;
    },
  ) {
    return await this.resourcesService.updateResourceContent(
      user,
      requestUpdateResourceContentDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllResources(@GetUser() user: User) {
    return await this.resourcesService.getAllResources(user);
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
    @GetUser() user: User,
  ) {
    return await this.resourcesService.deleteResource(
      pathParam,
      queryParam,
      user,
    );
  }
}
