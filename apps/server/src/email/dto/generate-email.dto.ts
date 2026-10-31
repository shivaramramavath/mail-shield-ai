import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class GenerateEmailDto {
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  prompt!: string;

  @IsString()
  @IsIn(['professional', 'formal', 'casual', 'friendly'])
  tone!: string;

  @IsString()
  @IsIn(['short', 'medium', 'detailed'])
  length!: string;
}
