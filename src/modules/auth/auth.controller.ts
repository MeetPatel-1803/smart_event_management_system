import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResponseService } from 'src/shared/response/apiResponse.service';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { Messages } from 'src/shared/messages/messages';
import { ResponseDto } from 'src/common/dto/response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { AuthUserGuard } from 'src/common/guards/auth.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthTokenDto } from './dto/auth-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseService: ResponseService,
  ) {}

  @Post('/register')
  async register(
    @Body() body: RegisterDto,
  ): Promise<ResponseDto<RegisterResponseDto>> {
    const { data, meta } = await this.authService.register(body);

    return this.responseService.success(
      data,
      CONSTANTS.META_CODE.SUCCESS,
      Messages.USER_REGISTERED,
      { accessToken: meta.accessToken, refreshToken: meta.refreshToken },
    );
  }

  @Post('/login')
  async login(
    @Body() body: LoginDto,
  ): Promise<ResponseDto<RegisterResponseDto>> {
    const { data, meta } = await this.authService.login(body);

    return this.responseService.success(
      data,
      CONSTANTS.META_CODE.SUCCESS,
      Messages.USER_LOGGED_IN,
      { accessToken: meta.accessToken, refreshToken: meta.refreshToken },
    );
  }

  // Imp: If we write directly like this: @UseGuards(authUser) It will give error.
  //      UseGuards expects guard classes where `CanActivate` is implemented.
  @Post('/forgot-password')
  @UseGuards(AuthUserGuard)
  async forgotPassword(
    @Body() body: { email: string },
  ): Promise<ResponseDto<string>> {
    const data = await this.authService.forgotPassword(body.email);

    return this.responseService.success(
      data,
      CONSTANTS.META_CODE.SUCCESS,
      Messages.FORGOT_PASSWORD,
    );
  }

  @Post('/reset-password')
  @UseGuards(AuthUserGuard)
  async resetPassword(
    @Query('tokenId') tokenId: string,
    @Body() body: ResetPasswordDto,
  ): Promise<ResponseDto<null>> {
    await this.authService.resetPassword(body, tokenId);

    return this.responseService.successWithoutData(
      CONSTANTS.META_CODE.SUCCESS,
      Messages.PASSWORD_RESET,
    );
  }

  @Post('/logout')
  @UseGuards(AuthUserGuard)
  async logout(@Body() token: string) {
    await this.authService.logout(token);

    return this.responseService.successWithoutData(
      CONSTANTS.META_CODE.SUCCESS,
      Messages.USER_LOGGED_OUT,
    );
  }

  @Post('/refresh-token')
  async refreshToken(
    @Body() body: { token: string },
  ): Promise<ResponseDto<AuthTokenDto>> {
    const tokens = await this.authService.refreshToken(body.token);

    return this.responseService.success(
      tokens,
      CONSTANTS.META_CODE.SUCCESS,
      Messages.REFRESH_TOKEN_GENERATED,
    );
  }
}
