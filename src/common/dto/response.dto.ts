
export class ApiResponseDto<T> {
   success: boolean;
   message: string;
   data?: T;
   errors?: any;
   timestamp: Date;

   constructor(
      success: boolean,
      message: string,
      data?: T,
      errors?: any,
   ) {
      this.success = success;
      this.message = message;
      this.data = data;
      this.errors = errors;
      this.timestamp = new Date();
   }
}