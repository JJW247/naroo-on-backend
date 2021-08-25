import { IsNotEmpty, IsString } from 'class-validator';
import { SignUpDto } from './signup.dto';

export class AddTeacherDto extends SignUpDto {
  @IsString()
  @IsNotEmpty()
  introduce: string;
}
