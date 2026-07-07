import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.message || 'Internal server error';

    console.error('EXCEPTION CAUGHT BY FILTER:', exception);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseData = exception.getResponse();
      console.error('HTTP Exception:', responseData);
      
      const resMessage = typeof responseData === 'string' ? responseData : (responseData as any).message || message;
      // ValidationPipe returns an array of messages. Extract the first one so the frontend receives a string.
      message = Array.isArray(resMessage) ? resMessage[0] : resMessage;
    } 
    // Mongoose duplicate key
    else if (exception.code === 11000) {
      status = HttpStatus.BAD_REQUEST;
      message = `Duplicate ${Object.keys(exception.keyValue)} entered`;
    } 
    // Wrong Mongodb Id error
    else if (exception.name === 'CastError') {
      status = HttpStatus.BAD_REQUEST;
      message = `Resource not found. Invalid: ${exception.path}`;
    }
    // Wrong JWT error
    else if (exception.name === 'JsonWebTokenError') {
      status = HttpStatus.BAD_REQUEST;
      message = `Json Web Token is invalid, Try again`;
    }
    // JWT EXPIRE error
    else if (exception.name === 'TokenExpiredError') {
      status = HttpStatus.BAD_REQUEST;
      message = `Json Web Token is Expired, Try again`;
    }

    response.status(status).json({
      success: false,
      message,
    });
  }
}
