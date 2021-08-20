import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { LecturesModule } from './lectures/lectures.module';

@Module({
  imports: [UsersModule, LecturesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
