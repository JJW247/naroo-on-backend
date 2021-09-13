import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async sendVerifyEmail(user: User) {
    await this.mailerService.sendMail({
      to: user.email,
      from: this.configService.get<string>('MAILGUN_USER'),
      subject: '마포런 이메일 인증 메일입니다!',
      html: `<a href="${process.env.FRONT_URL}/verify/${user.verifyToken}">이메일 인증하기</a>`,
    });
  }

  async verifyCode(param: { requestToken: string }) {
    const user = await this.usersRepository.findOne({
      where: {
        verifyToken: param.requestToken,
      },
    });

    if (!user)
      throw new HttpException(
        '잘못된 인증 요청입니다!',
        HttpStatus.UNAUTHORIZED,
      );

    user.verifyToken = null;
    user.isAuthorized = true;

    await this.usersRepository.save(user);

    const token = this.jwtService.sign({ id: user.id });

    return { token };
  }
}
