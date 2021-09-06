import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class AddTeacherDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @Length(2, 13)
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  introduce: string;
}
