import { Injectable } from '@nestjs/common';

export interface ResponseMeta {
  code: number;
  message?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  data: T;
  meta: ResponseMeta;
}

export type ResponseExtras = Record<string, unknown>;

@Injectable()
export class ResponseService {
  success<T>(
    data: T,
    code = 1,
    message?: string,
    extras?: ResponseExtras,
  ): ApiResponse<T> {
    return {
      data,
      meta: {
        code,
        message,
        ...extras,
      },
    };
  }

  successWithoutData(
    code = 1,
    message?: string,
    extras?: ResponseExtras,
  ): ApiResponse<null> {
    return {
      data: null,
      meta: {
        code,
        message,
        ...extras,
      },
    };
  }

  error<T>(data: T, code = 400, message?: string): ApiResponse<T> {
    return {
      data,
      meta: {
        code,
        message,
      },
    };
  }

  errorWithoutData(
    code = 0,
    message?: string,
    metaCode: number | null = null,
  ): ApiResponse<null> {
    return {
      data: null,
      meta: {
        code: metaCode ?? code,
        message,
      },
    };
  }

  internalServerError(message = 'Internal server error') {
    return {
      code: 500,
      message,
    };
  }
}
