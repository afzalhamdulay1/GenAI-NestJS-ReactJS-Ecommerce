import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please enter a valid email' })
  @IsNotEmpty({ message: 'Please enter your email' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Please enter a password' })
  password: string;
}
