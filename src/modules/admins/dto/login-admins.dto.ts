import { IsEmail, IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from "class-validator";


export class LoginAdminsDto {
   @IsEmail()
   @IsNotEmpty()
   @MaxLength(255)
   @MinLength(3)
   email: string;

   @IsString()
   @IsNotEmpty()
   @MaxLength(255)
   @MinLength(8)
   password: string;
};

export class VerifyOTPDto {
   @IsUUID()
   @IsNotEmpty()
   @MaxLength(36)
   @MinLength(36)
   session_id: string;

   @IsString()
   @IsNotEmpty()
   @MaxLength(6)
   @MinLength(6)
   otp: string;
};