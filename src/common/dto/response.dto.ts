import { Expose } from 'class-transformer';
import { Allow, IsObject } from 'class-validator';

export class ResponseMetaDTO<
  T = {
    total?: number;
    limit?: number;
    page?: number;
    pageCount?: number;
    code: number;
    message?: string;
    accessToken?: string;
    refreshToken?: string;
  },
> {
  constructor(partial: Partial<T>) {
    Object.assign(this, partial);
  }

  @Expose()
  code: number;

  @Expose()
  message?: string;

  @Expose()
  accessToken?: string;

  @Expose()
  refreshToken?: string;

  @Expose()
  total?: number;

  @Expose()
  limit?: number;

  @Expose()
  page?: number;

  @Expose()
  pageCount?: number;
}

export class ResponseDto<T1 = any, T2 = any> {
  constructor(partial: ResponseDto<T1, T2>) {
    Object.assign(this, partial);
  }

  @Expose()
  @Allow()
  data: T1;

  @Expose()
  @IsObject()
  meta: T2 | ResponseMetaDTO;
}
