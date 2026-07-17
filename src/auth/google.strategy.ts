import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    const { id, displayName, emails, photos } = profile;
    const email = emails && emails[0] ? emails[0].value : '';
    const avatarUrl = photos && photos[0] ? photos[0].value : '';

    // Custom uploaded Google profile photos contain "/a-/" in their CDN path
    const isCustomGoogleAvatar = avatarUrl && avatarUrl.includes('/a-/');

    const googleUser = {
      googleId: id,
      email,
      name: displayName,
      avatar: isCustomGoogleAvatar ? { url: avatarUrl, public_id: '' } : undefined,
    };

    return await this.usersService.findOrCreateGoogleUser(googleUser);
  }
}
