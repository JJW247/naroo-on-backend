import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entity/user.entity';
import { UsersRepository } from '../repository/users.repository';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get<string>('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload) {
    const { id } = payload;
    const user = await this.usersRepository.findOne({ id });

    if (!user) {
      throw new HttpException(
        '존재하지 않는 유저입니다!',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!user.isAuthorized) {
      throw new HttpException(
        '인증되지 않은 유저입니다!',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return id;
  }
}
