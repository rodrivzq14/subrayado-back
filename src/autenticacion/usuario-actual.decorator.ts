import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UsuarioToken {
  id: string;
  nombreUsuario: string;
  perfil: string;
}

export const UsuarioActual = createParamDecorator(
  (_dato: unknown, contexto: ExecutionContext): UsuarioToken =>
    contexto.switchToHttp().getRequest().usuario,
);