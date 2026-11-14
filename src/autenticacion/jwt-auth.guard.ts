import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService, private usuarios: UsuariosService) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const req = contexto.switchToHttp().getRequest();
    const [tipo, token] = (req.headers.authorization ?? '').split(' ');
    if (tipo !== 'Bearer' || !token) throw new UnauthorizedException('Falta el token de acceso');

    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('El token es inválido o está vencido');
    }

    const usuario = await this.usuarios.buscarPorId(payload.sub);
    if (!usuario) throw new UnauthorizedException('La sesión ya no es válida');
    if (!usuario.activo) throw new UnauthorizedException('Tu usuario está deshabilitado');

    req.usuario = { id: usuario.id, nombreUsuario: usuario.nombreUsuario, perfil: usuario.perfil };
    return true;
  }
}
