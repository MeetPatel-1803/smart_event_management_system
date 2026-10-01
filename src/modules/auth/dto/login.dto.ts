// import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  // @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  // Note: @ApiProperty() Used to show the request payload on swagger UI.
  password: string;
}
