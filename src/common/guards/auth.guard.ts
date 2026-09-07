import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { JwtServices } from 'src/modules/auth/strategies/jwt.strategies';
import { User } from 'src/modules/users/entities/user.entity';
import { Messages } from 'src/shared/messages/messages';
import { ApiError } from 'src/shared/response/apiError.service';
import { Repository } from 'typeorm';

export interface AuthenticatedRequest extends Request {
  user: User;
}

@Injectable()
export class AuthUserGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtServices,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<AuthenticatedRequest>();

    const token = request.headers.authorization;

    // if token is not present
    if (!token || typeof token !== 'string') {
      throw ApiError.unauthorized(Messages.UNAUTHORIZED);
    }

    const tokenWithoutBearer = token.split(' ')[1];

    // if token is empty
    if (!tokenWithoutBearer || typeof tokenWithoutBearer !== 'string') {
      throw ApiError.unauthorized(Messages.UNAUTHORIZED);
    }

    const decodedToken = this.jwtService.verifyAccessToken(tokenWithoutBearer);
    const user = await this.userRepository.findOneBy({
      id: decodedToken.id,
    });

    if (!user?.refreshToken) {
      throw ApiError.unauthorized(Messages.UNAUTHORIZED);
    }

    request.user = user;
    return true;
  }
}
