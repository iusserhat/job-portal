import { IsDefined, IsEmail, MaxLength, MinLength } from "class-validator";

export class RegisterUserAccountRequest {
  @IsDefined({ message: "User account type is required" })
  user_type_name!: string;

  @IsDefined({ message: "Email is required" })
  @IsEmail({}, { message: "Email format is invalid" })
  email!: string;

  @IsDefined({ message: "Password is required" })
  @MinLength(8, { message: "Password must be at least 8 characters" })
  @MaxLength(20, { message: "Password cannot exceed 20 characters" })
  password!: string;
}
