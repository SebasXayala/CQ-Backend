import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { TokenBlacklistService } from './token-blacklist.service';

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(UsersService)
    private readonly usersService: UsersService,
    @Inject(TokenBlacklistService)
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true, // Esto nos permite acceder al request
    });
  }

  async validate(request: any, payload: JwtPayload) {
    // Obtener el token del request
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    // Verificar si el token está en la blacklist
    if (token && this.tokenBlacklistService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException('Token invalidado - sesión cerrada');
    }

    // Buscar usuario en la base de datos y validar el rol
    const user = await this.usersService.findOne(payload.sub);
    if (!user || user.id_role !== 1) {
      throw new UnauthorizedException('No autorizado: solo usuarios con role de administrador pueden acceder a esta ruta');
    }
    return { userId: user.id_user, email: user.email, role: user.id_role };
  }
}
