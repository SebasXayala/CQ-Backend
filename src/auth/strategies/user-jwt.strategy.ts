import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtBlacklistService } from '../jwt-blacklist.service';

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
    constructor(
        private configService: ConfigService,
        private jwtBlacklistService: JwtBlacklistService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET_USER') || 'default-secret',
        });
    }

    async validate(payload: any) {
        // Verificar si el token está en la lista negra
        if (this.jwtBlacklistService.isTokenBlacklisted(payload.jti, 'user')) {
            throw new UnauthorizedException('Token has been invalidated');
        }

        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
            userType: 'user',
            jti: payload.jti,
        };
    }
}
