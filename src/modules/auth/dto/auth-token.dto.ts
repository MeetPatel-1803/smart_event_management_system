import { Expose } from 'class-transformer';

export class AuthTokenDto {
  constructor(partial: AuthTokenDto) {
    Object.assign(this, partial);
  }

  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;
}
