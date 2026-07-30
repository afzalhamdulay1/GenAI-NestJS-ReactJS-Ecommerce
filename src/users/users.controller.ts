import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Put,
  UseGuards,
  Param,
  Delete,
  UseInterceptors,
  Logger,
  Req,
  UploadedFiles,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import type { UserDocument } from './schemas/user.schema';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GoogleAuthGuard } from '../auth/guards/google-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Get('auth/google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req: any) {
    // This route initiates the Google OAuth flow
  }

  @Get('auth/google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    this.usersService.setCookieToken(req.user, res);
    res.redirect('/');
  }

  @Post('register')
  @UseInterceptors(AnyFilesInterceptor({ limits: { fieldSize: 50 * 1024 * 1024 } }))
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    return this.usersService.register(registerDto, res);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    return this.usersService.login(loginDto, res);
  }

  @Post('password/forgot')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.usersService.forgotPassword(forgotPasswordDto);
  }

  @Put('password/reset/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
    @Res() res: Response,
  ) {
    return this.usersService.resetPassword(token, resetPasswordDto, res);
  }

  @Get('logout')
  async logout(@Res() res: Response) {
    return this.usersService.logout(res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getUserDetails(@CurrentUser() user: UserDocument) {
    return this.usersService.getUserDetails(user);
  }

  @Put('password/update')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @CurrentUser() user: UserDocument,
    @Res() res: Response,
  ) {
    return this.usersService.updatePassword(updatePasswordDto, user, res);
  }

  @Put('me/update')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AnyFilesInterceptor({ limits: { fieldSize: 50 * 1024 * 1024 } }))
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser() user: UserDocument,
  ) {
    Logger.debug(`UPDATE PROFILE DTO: ${JSON.stringify(updateProfileDto)}`, 'UsersController');
    return this.usersService.updateProfile(updateProfileDto, user);
  }

  @Post('wishlist/:id')
  @UseGuards(JwtAuthGuard)
  async toggleWishlist(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.usersService.toggleWishlist(id, user);
  }

  @Get('wishlist')
  @UseGuards(JwtAuthGuard)
  async getWishlist(@CurrentUser() user: UserDocument) {
    return this.usersService.getWishlist(user);
  }

  // Admin Routes
  @Get('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('admin/user/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getSingleUser(@Param('id') id: string) {
    return this.usersService.getSingleUser(id);
  }

  @Put('admin/user/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateUserRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateUserRole(id, updateUserRoleDto);
  }

  @Delete('admin/user/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
