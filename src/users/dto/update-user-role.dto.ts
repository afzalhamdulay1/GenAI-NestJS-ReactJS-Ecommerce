import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail({}, { message: 'Please enter a valid email' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty({ message: 'Please enter role' })
  role: string;
}
