import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { errorResponse } from '../utils/response/response';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
   private readonly logger = new Logger(AllExceptionsFilter.name);

   catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const status =
         exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

      const message = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';
      
      // Log the error for debugging
      if (!(exception instanceof HttpException)) {
         this.logger.error('Unhandled exception:', exception);
      } else {
         this.logger.error(`HTTP Exception [${status}]:`, message);
      }

      // error response get message, then errors object
      const error_response = errorResponse(
         typeof message === 'string' ? message : 'Error occurred',
         typeof message === 'object' ? message : undefined
      );
      response.status(status).json(error_response);
   }
};
