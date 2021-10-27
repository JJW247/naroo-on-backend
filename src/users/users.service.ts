import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CONST_ROLE_TYPE, ROLE_TYPE, User } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './repository/users.repository';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { v4 as UUID } from 'uuid';
import { InitPasswordDto } from './dto/init-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.createAdminUser();
  }

  async createAdminUser() {
    const existAdminUser = await this.usersRepository.findOne({
      where: { role: CONST_ROLE_TYPE.ADMIN },
    });
    if (existAdminUser === undefined) {
      const hashedPassword = await bcrypt.hash('abcd1234!', 10);
      await this.usersRepository.save({
        role: CONST_ROLE_TYPE.ADMIN,
        email: 'admin@test.com',
        nickname: '관리자',
        password: hashedPassword,
        phone: '010-0000-0000',
        isAgreeEmail: true,
        isAuthorized: true,
        verifyToken: null,
      });
    }
  }

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
    await this.mailerService.sendMail({
      to: user.email,
      from: this.configService.get<string>('MAILER_USER'),
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

  async sendInitPassword(initPasswordDto: InitPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: {
        email: initPasswordDto.email,
        nickname: initPasswordDto.nickname,
        phone: initPasswordDto.phone,
      },
    });

    if (!user)
      throw new HttpException(
        '계정을 찾을 수 없습니다!',
        HttpStatus.UNAUTHORIZED,
      );

    const randomPassword = UUID().substr(0, 16);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    user.password = hashedPassword;

    await this.mailerService.sendMail({
      to: user.email,
      from: this.configService.get<string>('MAILER_USER'),
      subject: '나루온 비밀번호 재설정 메일',
      html: `<div><p>${user.nickname} / ${user.email} 계정의 초기화된 비밀번호는 ${randomPassword} 입니다!</p><p>로그인하신 후 반드시 비밀번호를 재설정해주세요!</p></div>`,
    });

    await this.usersRepository.save(user);

    return user;
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
