import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, minlength: 3, maxlength: 30 })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ select: false })
  password?: string;

  @Prop({ type: { public_id: String, url: String } })
  avatar: {
    public_id: string;
    url: string;
  };

  @Prop({ default: 'user' })
  role: string;

  @Prop()
  googleId?: string;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpire?: Date;

  // Methods
  async comparePassword(enteredPassword: string): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
  }

  getResetPasswordToken(): string {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    this.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    return resetToken;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function () {
  if (!this.password || !this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Since methods defined in class aren't directly available in NestJS Mongoose unless added to Schema.methods
UserSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getResetPasswordToken = function (): string {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
  return resetToken;
};
