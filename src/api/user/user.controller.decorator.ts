import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChargePointReq } from './dto/charge-point.dto';
import { GetPointRes } from './dto/get-point.dto';

export function GetPointSwagger() {
  return applyDecorators(
    ApiTags('유저 포인트'),
    ApiOperation({ summary: '잔액 조회' }),
    ApiParam({
      name: 'userId',
      type: 'number',
      example: 12,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: '잔액 조회 성공',
      type: GetPointRes,
      schema: {
        type: 'object',
        properties: {
          userId: { type: 'number' },
          balance: { type: 'number' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: '유저 정보가 존재하지 않음',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number' },
          message: { type: 'string' },
        },
      },
    }),
  );
}

export function ChargePointSwagger() {
  return applyDecorators(
    ApiTags('유저 포인트'),
    ApiOperation({ summary: '잔액 충전' }),
    ApiBody({
      type: ChargePointReq,
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: '잔액 충전 성공',
      type: GetPointRes,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: '유저 정보가 존재하지 않음',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number' },
          message: { type: 'string' },
        },
      },
    }),
  );
}
