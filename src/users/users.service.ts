import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import * as crypto from 'crypto';
import { sendEmail } from '../common/utils/send-email.util';
import * as cloudinary from 'cloudinary';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject('Cloudinary') private cloudinaryProvider: any,
  ) {}

  private sendToken(user: any, statusCode: number, res: Response) {
    const token = this.jwtService.sign({ id: user._id });

    const cookieExpire = this.configService.get<number>('COOKIE_EXPIRE') || 5;

    const options = {
      expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.status(statusCode).cookie('token', token, options).json({
      success: true,
      user,
      token,
    });
  }

  async register(registerDto: RegisterDto, res: Response) {
    // In production, you would upload avatar to cloudinary and get URL
    // For now we assume registerDto.avatar contains a base64 string or similar from frontend, or we handle it via Multer.
    // The original app used express-fileupload and expected `req.body.avatar`. 
    // We will assume avatar is passed in req.body.
    
    let avatarUrl = '';
    let avatarPublicId = '';

    if (registerDto.avatar) {
      const myCloud = await cloudinary.v2.uploader.upload(registerDto.avatar, {
        folder: 'avatars',
        width: 150,
        crop: 'scale',
      });
      avatarUrl = myCloud.secure_url;
      avatarPublicId = myCloud.public_id;
    }

    const user = await this.userModel.create({
      name: registerDto.name,
      email: registerDto.email,
      password: registerDto.password,
      avatar: {
        public_id: avatarPublicId,
        url: avatarUrl,
      },
    });

    this.sendToken(user, 201, res);
  }

  async login(loginDto: LoginDto, res: Response) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email }).select('+password');

    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      throw new BadRequestException('Invalid email or password');
    }

    this.sendToken(user, 200, res);
  }

  async logout(res: Response) {
    res.cookie('token', null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'Logged out',
    });
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: forgotPasswordDto.email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const resetPasswordUrl = `${frontendUrl}/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

    try {
      await sendEmail({
        email: user.email,
        subject: `Ecommerce Password Recovery`,
        message,
      });

      return {
        success: true,
        message: `Email sent to ${user.email} successfully`,
      };
    } catch (error) {
      user.resetPasswordToken = '' as any;
      user.resetPasswordExpire = null as any;
      await user.save({ validateBeforeSave: false });

      throw new BadRequestException(error.message);
    }
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto, res: Response) {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await this.userModel.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new BadRequestException('Reset Password Token is invalid or has been expired');
    }

    if (resetPasswordDto.password !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException('Password does not match');
    }

    user.password = resetPasswordDto.password;
    user.resetPasswordToken = '' as any;
    user.resetPasswordExpire = null as any;

    await user.save();

    this.sendToken(user, 200, res);
  }

  async getUserDetails(user: any) {
    const foundUser = await this.userModel.findById(user.id);
    return {
      success: true,
      user: foundUser,
    };
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto, user: any, res: Response) {
    const foundUser = await this.userModel.findById(user.id).select('+password');
    
    if (!foundUser) {
      throw new BadRequestException('User not found');
    }

    const isPasswordMatched = await foundUser.comparePassword(updatePasswordDto.oldPassword);

    if (!isPasswordMatched) {
      throw new BadRequestException('Old Password is incorrect');
    }

    if (updatePasswordDto.newPassword !== updatePasswordDto.confirmPassword) {
      throw new BadRequestException('Password does not match');
    }

    foundUser.password = updatePasswordDto.newPassword;
    await foundUser.save();

    this.sendToken(foundUser, 200, res);
  }

  async updateProfile(updateProfileDto: UpdateProfileDto, user: any) {
    const newUserData: any = {
      name: updateProfileDto.name,
      email: updateProfileDto.email,
    };

    if (updateProfileDto.avatar) {
      const foundUser = await this.userModel.findById(user.id);
      
      if (!foundUser) {
        throw new BadRequestException('User not found');
      }

      const imageId = foundUser.avatar.public_id;
      if (imageId) {
          await cloudinary.v2.uploader.destroy(imageId);
      }

      const myCloud = await cloudinary.v2.uploader.upload(updateProfileDto.avatar, {
        folder: 'avatars',
        width: 150,
        crop: 'scale',
      });

      newUserData.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(user.id, newUserData, {
      returnDocument: 'after',
      runValidators: true,
      useFindAndModify: false,
    });

    return {
      success: true,
      user: updatedUser,
    };
  }

  // Admin Methods
  async getAllUsers() {
    const users = await this.userModel.find();
    return {
      success: true,
      users,
    };
  }

  async getSingleUser(id: string) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new BadRequestException(`User does not exist with Id: ${id}`);
    }

    return {
      success: true,
      user,
    };
  }

  async updateUserRole(id: string, updateUserRoleDto: UpdateUserRoleDto) {
    const newUserData = {
      name: updateUserRoleDto.name,
      email: updateUserRoleDto.email,
      role: updateUserRoleDto.role,
    };

    const user = await this.userModel.findByIdAndUpdate(id, newUserData, {
      returnDocument: 'after',
      runValidators: true,
      useFindAndModify: false,
    });

    if (!user) {
      throw new BadRequestException(`User does not exist with Id: ${id}`);
    }

    return {
      success: true,
      user,
    };
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new BadRequestException(`User does not exist with Id: ${id}`);
    }

    if (user.email === 'afzalhamdulay1@gmail.com' || user.email === 'afzal@gmail.com') {
      throw new BadRequestException('You cannot delete the primary owner account');
    }

    const imageId = user.avatar.public_id;
    if (imageId) {
        await cloudinary.v2.uploader.destroy(imageId);
    }

    await user.deleteOne();

    return {
      success: true,
      message: 'User Deleted Successfully',
    };
  }
}
