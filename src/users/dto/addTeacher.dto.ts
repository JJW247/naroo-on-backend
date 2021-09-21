import { IsNotEmpty, IsString } from 'class-validator';
import { SignUpDto } from './signUp.dto';

export class AddTeacherDto extends SignUpDto {
  @IsString({ message: '강사 소개 메시지를 문자열 형식으로 입력해주세요!' })
  @IsNotEmpty({ message: '강사 소개 메시지를 입력해주세요!' })
  introduce: string;
}
