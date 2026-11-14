import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(contexto: ExecutionContext): boolean {
    const { usuario } = contexto.switchToHttp().getRequest();
    if (usuario?.perfil !== 'administrador') {
      throw new ForbiddenException('Solo un administrador puede hacer esto');
    }
    return true;
  }
}
