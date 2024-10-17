import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  createToken(sessionId: number): string {
    return this.jwtService.sign({ sessionId });
  }

  async getSessionId(token: string): Promise<number> {
    try {
      const decoded = await this.jwtService.verifyAsync<{ sessionId: number }>(
        token,
      );
      return decoded.sessionId;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
