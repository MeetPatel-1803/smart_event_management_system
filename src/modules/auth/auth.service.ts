import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiError } from 'src/shared/response/apiError.service';
import { compare, hash } from 'bcrypt';
import { Messages } from 'src/shared/messages/messages';
import { LoginDto } from './dto/login.dto';
import { JwtServices } from 'src/modules/auth/strategies/jwt.strategies';
import { RegisterResponseDto } from './dto/register-response.dto';
import { AuthTokenDto } from './dto/auth-token.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { Helper } from 'src/common/helper/helper.service';
import { EmailService } from '../email/email.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtServices,
    private readonly emailService: EmailService,
  ) {}

  async register(
    body: RegisterDto,
  ): Promise<ResponseDto<RegisterResponseDto, AuthTokenDto>> {
    const { name, email, role, password } = body;

    const user = await this.userRepository.findOneBy({ email });

    if (user) {
      throw ApiError.conflict(Messages.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await hash(password, 10);

    const newUser = this.userRepository.create({
      name,
      email,
      role,
      password: hashedPassword,
    });

    const accessToken = this.jwtService.signAccessToken({
      id: newUser.id,
      role: newUser.role,
    });

    const refreshToken = this.jwtService.signRefreshToken({
      id: newUser.id,
      role: newUser.role,
    });

    newUser.refreshToken = refreshToken;
    await this.userRepository.save(newUser);

    return new ResponseDto({
      data: new RegisterResponseDto(newUser),
      meta: new AuthTokenDto({ accessToken, refreshToken }),
    });
  }

  async login(
    body: LoginDto,
  ): Promise<ResponseDto<RegisterResponseDto, AuthTokenDto>> {
    const { email, password } = body;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (!existingUser) {
      throw ApiError.notFound(Messages.USER_NOT_FOUND);
    }

    const isPasswordValid = await compare(password, existingUser.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized(Messages.INVALID_EMAIL_OR_PASSWORD);
    }

    const accessToken = this.jwtService.signAccessToken({
      id: existingUser.id,
      role: existingUser.role,
    });

    const refreshToken = this.jwtService.signRefreshToken({
      id: existingUser.id,
      role: existingUser.role,
    });

    existingUser.refreshToken = refreshToken;
    await this.userRepository.save(existingUser);

    return new ResponseDto({
      data: new RegisterResponseDto(existingUser),
      meta: new AuthTokenDto({ accessToken, refreshToken }),
    });
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await this.userRepository.findOneBy({
      email,
    });

    if (!user) {
      throw ApiError.notFound(Messages.USER_NOT_FOUND);
    }

    const token = Helper.randomTokens(2);
    const date = new Date();
    const tokenExpire = new Date(date.setMinutes(date.getMinutes() + 1));

    const setToken = await this.userRepository.update(user.id, {
      resetToken: token,
      resetTokenExpire: tokenExpire,
    });

    if (!setToken) {
      throw ApiError.badRequest(Messages.INVALID_EMAIL);
    }

    const url = await this.emailService.sendResetPasswordEmail(email, token);

    return url;
  }

  async resetPassword(body: ResetPasswordDto, tokenId: string): Promise<void> {
    const { password } = body;

    const user = await this.userRepository.findOneBy({ resetToken: tokenId });
    if (!user) {
      throw ApiError.notFound(Messages.INVALID_TOKEN);
    }

    if (user?.resetTokenExpire && user?.resetTokenExpire < new Date()) {
      throw ApiError.unauthorized(Messages.TOKEN_EXPIRED);
    }

    const hashedPassword = await hash(password, 10);

    const updatedUser = await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpire: null,
    });

    if (!updatedUser) {
      throw ApiError.invalidToken(Messages.INVALID_TOKEN);
    }
  }

  async logout(token: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ refreshToken: token });

    if (!user) {
      throw ApiError.notFound(Messages.USER_NOT_FOUND);
    }

    const updatedUser = await this.userRepository.update(user.id, {
      refreshToken: null,
    });

    if (!updatedUser) {
      throw ApiError.badRequest(Messages.INVALID_TOKEN);
    }
  }

  async refreshToken(token: string): Promise<AuthTokenDto> {
    const decoded = this.jwtService.verifyRefreshToken(token);

    const user = await this.userRepository.findOneBy({ id: decoded.id });
    if (!user) {
      throw ApiError.notFound(Messages.USER_NOT_FOUND);
    }

    const accessToken = this.jwtService.signAccessToken({
      id: user.id,
      role: user.role,
    });

    const refreshToken = this.jwtService.signRefreshToken({
      id: user.id,
      role: user.role,
    });

    return new AuthTokenDto({ accessToken, refreshToken });
  }
}
