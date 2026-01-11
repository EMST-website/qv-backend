import { IsEmail, IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';


export class LoginAdminsDto {
   @ApiProperty({ 
      example: 'admin@example.com',
      description: 'Admin email address',
      minLength: 3,
      maxLength: 255
   })
   @IsEmail()
   @IsNotEmpty()
   @MaxLength(255)
   @MinLength(3)
   email: string;

   @ApiProperty({ 
      example: 'SecurePass123!',
      description: 'Admin password (min 8 characters)',
      minLength: 8,
      maxLength: 255
   })
   @IsString()
   @IsNotEmpty()
   @MaxLength(255)
   @MinLength(8)
   password: string;
};

export class VerifyOTPDto {
   @ApiProperty({ 
      example: '123e4567-e89b-12d3-a456-426614174000',
      description: 'Session ID received after login',
      minLength: 36,
      maxLength: 36
   })
   @IsUUID()
   @IsNotEmpty()
   @MaxLength(36)
   @MinLength(36)
   session_id: string;

   @ApiProperty({ 
      example: '123456',
      description: '6-digit OTP code sent to email',
      minLength: 6,
      maxLength: 6
   })
   @IsString()
   @IsNotEmpty()
   @MaxLength(6)
   @MinLength(6)
   otp: string;
};