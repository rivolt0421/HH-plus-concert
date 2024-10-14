import { JwtService } from '@nestjs/jwt';

export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  createToken(sessionId: number): string {
    return this.jwtService.sign({ sessionId });
  }
}
