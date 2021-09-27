import { IsDateString, IsOptional, IsString } from 'class-validator';

export class RequestUpdateLectureInfoDto {
  @IsString()
  @IsOptional()
  thumbnail: string;

  @IsDateString()
  @IsOptional()
  expired: Date;

  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  teacherName: string;

  @IsString({ each: true })
  @IsOptional({ each: true })
  images: string[];

  @IsString()
  @IsOptional()
  videosUrl: string;

  @IsString()
  @IsOptional()
  videoTitle: string;
}
