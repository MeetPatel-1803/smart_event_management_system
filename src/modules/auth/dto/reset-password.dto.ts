import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class ResetPasswordDto {
  // @IsNotEmpty()
  // @IsString()
  // token: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @IsStrongPassword(
    {},
    {
      message:
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  password: string;

  @IsNotEmpty()
  @IsString()
  @ValidateIf((obj: ResetPasswordDto) => obj.password !== obj.confirmPassword, {
    message: 'Password and confirm password must be the same.',
  })
  confirmPassword: string;
}
