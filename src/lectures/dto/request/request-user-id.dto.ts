import { IsNotEmpty, IsString } from 'class-validator';

export class RequestUserIdDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
