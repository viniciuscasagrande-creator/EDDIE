import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
interface RequestLike {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
}

interface ResponseLike {
  setHeader(name: string, value: string): void;
  status(code: number): {
    json(body: unknown): void;
  };
}
import { randomUUID } from 'node:crypto';

export type StandardApiErrorCode =
  | 'BACKEND_UNAVAILABLE'
  | 'BACKEND_TIMEOUT'
  | 'DATABASE_UNAVAILABLE'
  | 'UPSTREAM_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<ResponseLike>();
    const request = ctx.getRequest<RequestLike>();

    const correlationId =
      (request.headers['x-correlation-id'] as string) ||
      (request.headers['x-request-id'] as string) ||
      randomUUID();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: StandardApiErrorCode = 'INTERNAL_SERVER_ERROR';
    let errorName = 'Internal Server Error';
    let message = 'Ocorreu um erro interno no servidor.';
    let validationDetails: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        if (typeof resObj['code'] === 'string') {
          code = resObj['code'] as StandardApiErrorCode;
        }
        if (typeof resObj['error'] === 'string') {
          errorName = resObj['error'];
        }
        if (typeof resObj['message'] === 'string') {
          message = resObj['message'];
        } else if (Array.isArray(resObj['message'])) {
          message = resObj['message'].join('; ');
          validationDetails = resObj['message'];
        }
        if (resObj['errors']) {
          validationDetails = resObj['errors'];
        }
      } else if (typeof res === 'string') {
        message = res;
      }

      // Map status to canonical code if not explicitly given
      if (code === 'INTERNAL_SERVER_ERROR') {
        switch (status) {
          case HttpStatus.BAD_REQUEST:
            code = 'VALIDATION_ERROR';
            errorName = 'Bad Request';
            break;
          case HttpStatus.UNAUTHORIZED:
            code = 'UNAUTHORIZED';
            errorName = 'Unauthorized';
            break;
          case HttpStatus.FORBIDDEN:
            code = 'FORBIDDEN';
            errorName = 'Forbidden';
            break;
          case HttpStatus.NOT_FOUND:
            code = 'NOT_FOUND';
            errorName = 'Not Found';
            break;
          case HttpStatus.CONFLICT:
            code = 'CONFLICT';
            errorName = 'Conflict';
            break;
          case HttpStatus.SERVICE_UNAVAILABLE:
            code = 'BACKEND_UNAVAILABLE';
            errorName = 'Service Unavailable';
            break;
          case HttpStatus.GATEWAY_TIMEOUT:
            code = 'BACKEND_TIMEOUT';
            errorName = 'Gateway Timeout';
            break;
          case HttpStatus.BAD_GATEWAY:
            code = 'UPSTREAM_ERROR';
            errorName = 'Bad Gateway';
            break;
        }
      }
    } else if (exception instanceof Error) {
      const errName = exception.name || '';
      const errMsg = exception.message || '';

      if (
        errName.includes('PrismaClientInitializationError') ||
        errMsg.includes('Can\'t reach database server') ||
        errMsg.includes('DATABASE_TIMEOUT')
      ) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        code = 'DATABASE_UNAVAILABLE';
        errorName = 'Service Unavailable';
        message = 'O banco de dados está temporariamente indisponível.';
      } else if (errName.includes('PrismaClientKnownRequestError')) {
        const prismaErr = exception as { code?: string };
        if (prismaErr.code === 'P2002') {
          status = HttpStatus.CONFLICT;
          code = 'CONFLICT';
          errorName = 'Conflict';
          message = 'Registro conflitante: violação de unicidade.';
        } else if (prismaErr.code === 'P2025') {
          status = HttpStatus.NOT_FOUND;
          code = 'NOT_FOUND';
          errorName = 'Not Found';
          message = 'Registro solicitado não foi encontrado no banco de dados.';
        }
      } else {
        message = exception.message || 'Erro inesperado na operação.';
      }
    }

    this.logger.error(
      `[${request.method}] ${request.url} -> ${status} [${code}] [corr: ${correlationId}]: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.setHeader('x-correlation-id', correlationId);

    response.status(status).json({
      ok: false,
      code,
      error: errorName,
      message,
      correlationId,
      path: request.url,
      timestamp: new Date().toISOString(),
      ...(validationDetails ? { errors: validationDetails } : {}),
    });
  }
}
