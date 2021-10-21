import { IsNotEmpty, IsString } from 'class-validator';

export class RequestUpdateNoticeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
