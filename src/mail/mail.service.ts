import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SendEmailOptions {
  email: string;
  subject: string;
  message: string;
  attachments?: any[];
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      service: this.configService.get<string>('SMTP_SERVICE'),
      auth: {
        user: this.configService.get<string>('SMTP_MAIL'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendEmail(options: SendEmailOptions) {
    const mailOptions = {
      from: this.configService.get<string>('SMTP_MAIL'),
      to: options.email,
      subject: options.subject,
      text: options.message,
      attachments: options.attachments,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
