import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @Length(2, 10)
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  phone_number: string;
}
