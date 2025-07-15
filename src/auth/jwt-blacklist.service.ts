import { Injectable } from '@nestjs/common';
import * as NodeCache from 'node-cache';

@Injectable()
export class JwtBlacklistService {
    private blacklistedTokens: NodeCache;

    constructor() {
        // Cache con TTL de 7 días (máximo tiempo de vida de un token)
        this.blacklistedTokens = new NodeCache({ stdTTL: 7 * 24 * 60 * 60 });
    }

    /**
     * Añade un token JTI a la lista negra
     * @param jti - JWT ID único del token
     * @param userType - Tipo de usuario ('user' o 'candidate')
     */
    blacklistToken(jti: string, userType: 'user' | 'candidate'): void {
        const key = `${userType}-${jti}`;
        this.blacklistedTokens.set(key, true);
    }

    /**
     * Verifica si un token está en la lista negra
     * @param jti - JWT ID único del token
     * @param userType - Tipo de usuario ('user' o 'candidate')
     * @returns true si el token está en la lista negra
     */
    isTokenBlacklisted(jti: string, userType: 'user' | 'candidate'): boolean {
        const key = `${userType}-${jti}`;
        return this.blacklistedTokens.has(key);
    }

    /**
     * Invalida todos los tokens de un usuario específico
     * @param userId - ID del usuario
     * @param userType - Tipo de usuario ('user' o 'candidate')
     */
    blacklistAllUserTokens(userId: string, userType: 'user' | 'candidate'): void {
        const pattern = `${userType}-*-${userId}`;
        const keys = this.blacklistedTokens.keys();

        keys.forEach(key => {
            if (key.includes(`-${userId}`)) {
                this.blacklistedTokens.set(key, true);
            }
        });
    }

    /**
     * Limpia tokens expirados de la lista negra (se ejecuta automáticamente)
     */
    cleanup(): void {
        // NodeCache maneja automáticamente la limpieza con TTL
        console.log('Tokens expirados limpiados automáticamente');
    }
}
