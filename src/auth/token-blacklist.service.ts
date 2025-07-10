import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenBlacklistService {
    private blacklistedTokens: Set<string> = new Set();

    constructor(private readonly jwtService: JwtService) { }

    /**
     * Añade un token a la blacklist
     * @param token - Token JWT a invalidar
     */
    blacklistToken(token: string): void {
        this.blacklistedTokens.add(token);
    }

    /**
     * Verifica si un token está en la blacklist
     * @param token - Token JWT a verificar
     * @returns true si está en la blacklist, false si no
     */
    isTokenBlacklisted(token: string): boolean {
        return this.blacklistedTokens.has(token);
    }

    /**
     * Limpia tokens expirados de la blacklist
     * Este método debería ejecutarse periódicamente
     */
    cleanExpiredTokens(): void {
        const now = Math.floor(Date.now() / 1000);

        for (const token of this.blacklistedTokens) {
            try {
                const decoded = this.jwtService.decode(token) as any;
                if (decoded && decoded.exp && decoded.exp < now) {
                    this.blacklistedTokens.delete(token);
                }
            } catch (error) {
                // Si el token no se puede decodificar, lo eliminamos de la blacklist
                this.blacklistedTokens.delete(token);
            }
        }
    }

    /**
     * Obtiene el número de tokens en la blacklist
     * @returns número de tokens en blacklist
     */
    getBlacklistSize(): number {
        return this.blacklistedTokens.size;
    }
}
