import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [ConfigModule, PassportModule],
  controllers: [AuthController],
  providers: [JwtStrategy],
})
export class AuthModule {}
