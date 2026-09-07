import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt.interface';
import { ApiError } from 'src/shared/response/apiError.service';
import { Messages } from 'src/shared/messages/messages';

@Injectable()
export class JwtServices {
  private readonly jwtSecret: string;
  private readonly jwtExpire: string;
  private readonly refreshSecret: string;
  private readonly refreshExpire: string;

  constructor(private readonly jwtService: JwtService) {
    this.jwtSecret = process.env.JWT_SECRET!;
    this.jwtExpire = process.env.JWT_EXPIRES_IN!;

    this.refreshSecret = process.env.REFRESH_SECRET!;
    this.refreshExpire = process.env.REFRESH_EXPIRES_IN!;
  }

  // sign access token
  signAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: '1d', //Note: will change this later
      secret: this.jwtSecret,
    });
  }

  // sign refresh token
  signRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: '30d', //Note: will change this later
      secret: this.refreshSecret,
    });
  }

  // verify access token
  verifyAccessToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify(token, {
        secret: this.jwtSecret,
      });
    } catch {
      throw ApiError.invalidToken(Messages.INVALID_TOKEN_OR_EXPIRE);
    }
  }

  // verify refresh token
  verifyRefreshToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify(token, {
        secret: this.refreshSecret,
      });
    } catch {
      throw ApiError.invalidToken(Messages.INVALID_TOKEN_OR_EXPIRE);
    }
  }
}
