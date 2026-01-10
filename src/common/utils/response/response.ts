import { ApiResponseDto } from '@/common/dto/response.dto';

export const successResponse = <T>(message: string, data?: T) => {
   return new ApiResponseDto(true, message, data)
};

export const errorResponse = (message: string, errors?: any) => {
   return new ApiResponseDto(false, message, undefined, errors);
};
