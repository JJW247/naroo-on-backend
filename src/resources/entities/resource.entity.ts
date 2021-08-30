import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';

const CONST_RESOURCE_TYPE = {
  ADMIN_EMAIL: 'admin_email',
  HEADER_LOGO: 'header_logo',
  FOOTER_LOGO: 'footer_logo',
  NOTICE_CAROUSEL: 'notice_carousel',
  ORG_CAROUSEL: 'org_carousel',
} as const;

export type RESOURCE_TYPE =
  typeof CONST_RESOURCE_TYPE[keyof typeof CONST_RESOURCE_TYPE];

@Entity()
export class Resource {
  @IsEnum(CONST_RESOURCE_TYPE)
  @IsNotEmpty()
  @PrimaryColumn('enum', {
    enum: CONST_RESOURCE_TYPE,
  })
  type: RESOURCE_TYPE;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @PrimaryColumn()
  content_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Column()
  content: string;
}
