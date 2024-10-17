import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CompletePaymentReq,
  CompletePaymentRes,
} from './dto/complete-payment.dto';
import { GetAvailableDatesRes } from './dto/get-available-dates.dto';
import { GetAvailableSeatsRes } from './dto/get-available-seats.dto';
import { ReserveSeatReq, ReserveSeatRes } from './dto/reserve-seat.dto';

export function GetAvailableDatesSwagger() {
  return applyDecorators(
    ApiTags('예약'),
    ApiOperation({ summary: '예약 가능 날짜 조회' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: '예약 가능 날짜 조회 성공',
      type: GetAvailableDatesRes,
    }),
  );
}

export function GetAvailableSeatsSwagger() {
  return applyDecorators(
    ApiTags('예약'),
    ApiOperation({ summary: '예약 가능 좌석 조회' }),
    ApiBearerAuth(),
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
        type: 'object',
        properties: {
          seats: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                number: { type: 'number' },
                price: { type: 'number' },
              },
            },
          },
        },
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
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: '좌석 예약 성공',
      type: ReserveSeatRes,
      schema: {
        type: 'object',
        properties: {
          reservationId: { type: 'number' },
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
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: '결제 처리 성공',
      type: CompletePaymentRes,
      schema: {
        type: 'object',
        properties: {
          paymentId: { type: 'number' },
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
