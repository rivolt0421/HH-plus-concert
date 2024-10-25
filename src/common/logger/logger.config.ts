import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';

const { combine, timestamp, printf } = winston.format;

// 커스텀 로그 포맷
const logFormat = printf(({ level, message, timestamp, context, trace }) => {
  return `${timestamp} [${level}] [${context}] ${message} ${trace || ''}`;
});

// HTTP 로그 포맷
const httpLogFormat = printf(({ timestamp, message }) => {
  return `${timestamp} ${message}`;
});

export const loggerOptions = {
  transports: [
    // 콘솔 로그
    new winston.transports.Console({
      level: 'debug',
      format: combine(
        timestamp(),
        nestWinstonModuleUtilities.format.nestLike(),
      ),
    }),
    // HTTP 로그
    new winston.transports.File({
      filename: 'logs/http.log',
      level: 'http',
      format: combine(timestamp(), httpLogFormat),
    }),
    // 에러 로그
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(timestamp(), logFormat),
    }),
    // 비즈니스 로그
    new winston.transports.File({
      filename: 'logs/info.log',
      level: 'info',
      format: combine(timestamp(), logFormat),
    }),
    // 데이터 분석용 로그
    new winston.transports.File({
      filename: 'logs/data.log',
      level: 'verbose',
      format: combine(timestamp(), logFormat),
    }),
  ],
};
