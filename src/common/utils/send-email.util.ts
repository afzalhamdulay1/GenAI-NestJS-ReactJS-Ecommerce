import * as nodemailer from 'nodemailer';

export const sendEmail = async (options: {
  email: string;
  subject: string;
  message: string;
  attachments?: any[];
}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
    attachments: options.attachments,
  };

  await transporter.sendMail(mailOptions);
};
