import { IsNotEmpty, IsString } from 'class-validator';
import { SignUpDto } from './signUp.dto';

export class AddTeacherDto extends SignUpDto {
  @IsString()
  @IsNotEmpty()
  introduce: string;
}
