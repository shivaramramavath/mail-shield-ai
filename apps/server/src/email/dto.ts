import { IsArray, ArrayMaxSize, ArrayMinSize, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
export class TextDto {
  @IsString() @MinLength(1) @MaxLength(20000) text!: string;
}
export class GenerateDto {
  @IsString() @MinLength(3) @MaxLength(2000) prompt!: string;
  @IsOptional() @IsIn(['professional', 'casual', 'formal']) tone?: string;
}
export class BatchDto {
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(100) @IsString({ each: true }) emails!: string[];
}
export class FeedbackDto extends TextDto {
  @IsIn(['spam', 'ham']) correctLabel!: 'spam' | 'ham';
}
