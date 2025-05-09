import { StatusCodes } from "http-status-codes";

export class ApiError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string) {
    return new ApiError(StatusCodes.BAD_REQUEST, message);
  }

  static unauthorized(message: string) {
    return new ApiError(StatusCodes.UNAUTHORIZED, message);
  }

  static forbidden(message: string) {
    return new ApiError(StatusCodes.FORBIDDEN, message);
  }

  static notFound(message: string) {
    return new ApiError(StatusCodes.NOT_FOUND, message);
  }

  static internal(message: string) {
    return new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, message);
  }
} 