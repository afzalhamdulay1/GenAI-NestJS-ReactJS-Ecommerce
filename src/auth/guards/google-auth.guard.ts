import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  handleRequest(err: any, user: any, info: any, context: any) {
    if (err || !user) {
      const response = context.switchToHttp().getResponse();
      return response.redirect('/login');
    }
    const request = context.switchToHttp().getRequest();
    request.user = user;
    return user;
  }
}
