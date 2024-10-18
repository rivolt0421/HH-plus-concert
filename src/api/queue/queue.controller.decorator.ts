import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EnterQueueReq, EnterQueueRes } from './dto/enter-queue.dto';
import { GetQueuePositionRes } from './dto/get-queue-position.dto';

export function EnterQueueSwagger() {
  return applyDecorators(
    ApiTags('대기열'),
    ApiOperation({ summary: '대기열 토큰 발급' }),
    ApiBody({
      type: EnterQueueReq,
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: '토큰 발급 성공',
      type: EnterQueueRes,
      schema: {
        type: 'object',
        properties: {
          token: { type: 'string' },
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

export function GetQueuePositionSwagger() {
  return applyDecorators(
    ApiTags('대기열'),
    ApiOperation({ summary: '대기 번호 조회' }),
    ApiBearerAuth(),
    ApiResponse({
      status: HttpStatus.OK,
      description: '대기 번호 조회 성공',
      type: GetQueuePositionRes,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: '토큰 검증 실패',
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
