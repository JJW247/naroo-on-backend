import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ROLE_TYPE, User } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './repository/users.repository';
import { SignUpDto } from './dto/signUp.dto';
import { SignInDto } from './dto/signIn.dto';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { v4 as UUID } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);

    if (!signUpDto.phone.match(/^[0-9]{3}[-]+[0-9]{4}[-]+[0-9]{4}$/)) {
      throw new HttpException(
        '휴대폰 번호를 정확하게 입력해주세요!',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isUniquePhone = await this.usersRepository.findOne({
      where: { phone: signUpDto.phone },
    });

    if (isUniquePhone !== undefined) {
      throw new HttpException(
        '동일한 휴대폰 번호가 존재합니다!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const verifyToken = UUID();

    const user = this.usersRepository.create({
      email: signUpDto.email,
      nickname: signUpDto.nickname,
      password: hashedPassword,
      phone: signUpDto.phone,
      isAgreeEmail: signUpDto.isAgreeEmail === 'true' ? true : false,
      isAuthorized: false,
      verifyToken: verifyToken,
    });

    await this.sendVerifyEmail(user);

    await this.usersRepository.save(user);

    return user;
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.usersRepository.findOne({
      where: {
        email: signInDto.email,
      },
      select: ['id', 'email', 'password', 'isAuthorized', 'verifyToken'],
    });

    if (!user) {
      throw new HttpException(
        '존재하지 않는 유저입니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.isAuthorized) {
      await this.sendVerifyEmail(user);
      throw new HttpException(
        '이메일 인증 메일을 재전송하였습니다. 이메일 인증을 완료해주세요!',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const checkPassword = await bcrypt.compare(
      signInDto.password,
      user.password,
    );

    if (!checkPassword) {
      throw new HttpException(
        '비밀번호가 일치하지 않습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = this.jwtService.sign({ id: user.id });

    return { token };
  }

  async sendVerifyEmail(user: User) {
    console.log(user.email);
    await this.mailerService.sendMail({
      to: user.email,
      from: this.configService.get<string>('MAILGUN_USER'),
      subject:
        '나루온 회원이 되신 것을 축하합니다! 링크 접속을 통해 이메일 인증 요청을 완료해주세요!',
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

  getMe(user: User) {
    return this.usersRepository.getMe(user);
  }

  getMyInfo(user: User) {
    return this.usersRepository.getMyInfo(user);
  }

  findAllUsers(user: User) {
    return this.usersRepository.findAllUsers(user);
  }

  updateUserInfo(
    param: { userId: string },
    user: User,
    updateUserInfoDto: {
      email: string | null;
      nickname: string | null;
      password: string | null;
      phone: string | null;
      role: ROLE_TYPE | null;
      introduce: string | null;
    },
  ) {
    return this.usersRepository.updateUserInfo(param, user, updateUserInfoDto);
  }

  deleteUser(param: { userId: string }, user: User) {
    return this.usersRepository.deleteUser(param, user);
  }
}
