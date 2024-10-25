import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { loggerOptions } from './logger.config';

@Global()
@Module({
  imports: [WinstonModule.forRoot(loggerOptions)],
  exports: [WinstonModule],
})
export class LoggerModule {}
