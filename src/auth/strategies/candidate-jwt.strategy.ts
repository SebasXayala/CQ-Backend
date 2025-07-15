import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtBlacklistService } from '../jwt-blacklist.service';

@Injectable()
export class CandidateJwtStrategy extends PassportStrategy(Strategy, 'candidate-jwt') {
    constructor(
        private configService: ConfigService,
        private jwtBlacklistService: JwtBlacklistService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET_CANDIDATE') || 'default-secret',
        });
    }

    async validate(payload: any) {
        // Verificar si el token está en la lista negra
        if (this.jwtBlacklistService.isTokenBlacklisted(payload.jti, 'candidate')) {
            throw new UnauthorizedException('Token has been invalidated');
        }

        return {
            candidateId: payload.sub,
            email: payload.email,
            identifier: payload.identifier,
            name: payload.name,
            userType: 'candidate',
            jti: payload.jti,
        };
    }
}
