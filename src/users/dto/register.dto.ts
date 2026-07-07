import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Please enter your name' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(30, { message: 'Name cannot exceed 30 characters' })
  name: string;

  @IsEmail({}, { message: 'Please enter a valid email' })
  @IsNotEmpty({ message: 'Please enter your email' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Please enter a password' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsOptional()
  avatar?: any;
}
