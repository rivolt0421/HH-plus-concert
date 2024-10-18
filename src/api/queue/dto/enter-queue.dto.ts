import { ApiProperty } from '@nestjs/swagger';

export class EnterQueueReq {
  @ApiProperty({ example: 'test@example.com', description: '이메일' })
  email: string;

  @ApiProperty({ example: 'password123', description: '비밀번호' })
  password: string;
}

export class EnterQueueRes {
  @ApiProperty({ example: 'token_abc123', description: '토큰' })
  token: string;
}
