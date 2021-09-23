import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from 'src/users/strategy/jwt.strategy';
import { UsersRepository } from './repository/users.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: 3600,
        },
      }),
    }),
    MailerModule.forRoot({
      transport: {
        service: 'Mailgun',
        host: process.env.MAILGUN_HOST,
        port: +process.env.MAILGUN_PORT,
        auth: {
          user: process.env.MAILGUN_USER,
          pass: process.env.MAILGUN_PASS,
        },
      },
    }),
    TypeOrmModule.forFeature([UsersRepository]),
  ],
  providers: [UsersService, JwtStrategy],
  controllers: [UsersController],
  exports: [JwtStrategy, PassportModule],
})
export class UsersModule {}
