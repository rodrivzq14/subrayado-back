import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const req = contexto.switchToHttp().getRequest();
    const [tipo, token] = (req.headers.authorization ?? '').split(' ');
    if (tipo !== 'Bearer' || !token) throw new UnauthorizedException('Falta el token de acceso');

    try {
      const payload = await this.jwt.verifyAsync(token);
      req.usuario = { id: payload.sub, nombreUsuario: payload.nombreUsuario, perfil: payload.perfil };
    } catch {
      throw new UnauthorizedException('El token es inválido o está vencido');
    }
    return true;
  }
}