import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ChargePointReq,
  CompletePaymentReq,
  CompletePaymentRes,
  EnterQueueReq,
  EnterQueueRes,
  GetAvailableDatesRes,
  GetAvailableSeatsRes,
  GetPointRes,
  GetQueuePositionRes,
  ReserveSeatReq,
  ReserveSeatRes,
} from './dto';

export function EnterQueueSwagger() {
  return applyDecorators(
    ApiTags('대기열'),
    ApiOperation({ summary: '대기열 토큰 발급' }),
    ApiBody({
      type: EnterQueueReq,
      description: 'userId가 "0"일 경우 User Not Exists 에러를 반환합니다.',
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: '토큰 발급 성공',
      type: EnterQueueRes,
      schema: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          queueNumber: { type: 'number' },
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
    ApiHeader({
      name: 'X-Mock-Token-Fail',
      required: false,
      description:
        '이 헤더가 "true"로 설정되면 토큰 검증 실패를 시뮬레이션합니다.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: '대기 번호 조회 성공',
      type: GetQueuePositionRes,
      schema: {
        type: 'object',
        properties: {
          queueNumber: { type: 'number' },
          estimatedWaitTime: { type: 'number' },
        },
      },
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

export function GetAvailableDatesSwagger() {
  return applyDecorators(
    ApiTags('예약'),
    ApiOperation({ summary: '예약 가능 날짜 조회' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: '예약 가능 날짜 조회 성공',
      type: GetAvailableDatesRes,
      schema: {
        type: 'array',
        items: { type: 'string', format: 'date' },
      },
    }),
  );
}

export function GetAvailableSeatsSwagger() {
  return applyDecorators(
    ApiTags('예약'),
    ApiOperation({ summary: '예약 가능 좌석 조회' }),
    ApiBearerAuth(),
    ApiHeader({
      name: 'X-Mock-Token-Fail',
      required: false,
      description:
        '이 헤더가 "true"로 설정되면 토큰 검증 실패를 시뮬레이션합니다.',
    }),
    ApiQuery({
      name: 'date',
      type: 'string',
      example: '2023-05-01',
      description: '조회할 날짜. 형식: YYYY-MM-DD',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: '예약 가능 좌석 조회 성공',
      type: GetAvailableSeatsRes,
      schema: {
        type: 'array',
        items: { type: 'number' },
      },
    }),
  );
}

export function ReserveSeatSwagger() {
  return applyDecorators(
    ApiTags('예약'),
    ApiOperation({ summary: '좌석 예약 요청' }),
    ApiBody({
      type: ReserveSeatReq,
      description:
        'seatNumber가 13인 경우, 이미 예약된 좌석으로 간주하여 에러를 반환합니다.',
    }),
    ApiBearerAuth(),
    ApiHeader({
      name: 'X-Mock-Token-Fail',
      required: false,
      description:
        '이 헤더가 "true"로 설정되면 토큰 검증 실패를 시뮬레이션합니다.',
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: '좌석 예약 성공',
      type: ReserveSeatRes,
      schema: {
        type: 'object',
        properties: {
          reservationId: { type: 'string' },
          expiresAt: { type: 'string', format: 'date-time' },
        },
      },
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
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: '이미 예약된 좌석',
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

export function CompletePaymentSwagger() {
  return applyDecorators(
    ApiTags('예약'),
    ApiOperation({ summary: '결제 처리' }),
    ApiBody({
      type: CompletePaymentReq,
      description:
        '예약 ID가 "invalid"인 경우 유효하지 않은 예약으로 간주합니다. 예약 ID가 "duplicate"인 경우 결제 정보 생성 실패로 간주합니다.',
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: '결제 처리 성공',
      type: CompletePaymentRes,
      schema: {
        type: 'object',
        properties: {
          paymentId: { type: 'string' },
          status: { type: 'string' },
        },
      },
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
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: '유효한 예약 정보가 존재하지 않음',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number' },
          message: { type: 'string' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: '결제 정보 생성 실패',
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

export function GetPointSwagger() {
  return applyDecorators(
    ApiTags('유저 포인트'),
    ApiOperation({ summary: '잔액 조회' }),
    ApiParam({
      name: 'userId',
      type: 'string',
      example: '12345',
      description:
        '조회할 사용자의 ID. "0"일 경우 User Not Exists 에러를 반환합니다.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: '잔액 조회 성공',
      type: GetPointRes,
      schema: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
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
      description: 'userId가 "0"일 경우 User Not Exists 에러를 반환합니다.',
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: '잔액 충전 성공',
      type: ChargePointReq,
      schema: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
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
