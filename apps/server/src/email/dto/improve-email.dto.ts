import { IsString, MaxLength, MinLength } from 'class-validator';

export class ImproveEmailDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20000)
  text!: string;
}
