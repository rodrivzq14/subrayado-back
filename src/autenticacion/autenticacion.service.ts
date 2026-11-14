import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { UsuarioDocument } from '../usuarios/schemas/usuario.schema';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AutenticacionService {
  constructor(private usuarios: UsuariosService, private jwt: JwtService) {}

  async registro(dto: RegistroDto, imagenPerfil?: string) {
    const usuario = await this.usuarios.registrar(dto, imagenPerfil);
    return this.respuesta(usuario);
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuarios.buscarPorCorreoOUsuario(dto.identificador);
    const ok = usuario && (await bcrypt.compare(dto.password, usuario.password));
    if (!usuario || !ok) throw new UnauthorizedException('Credenciales incorrectas');
    if (!usuario.activo) throw new UnauthorizedException('Tu usuario está deshabilitado');
    return this.respuesta(usuario);
  }

  // El guard ya validó la firma y el vencimiento; acá se confirma que el usuario siga habilitado
  async autorizar(id: string) {
    const usuario = await this.usuarioValido(id);
    return { usuario: this.usuarios.sinPassword(usuario) };
  }

  async refrescar(id: string) {
    const usuario = await this.usuarioValido(id);
    return { token: this.firmar(usuario) };
  }

  private async usuarioValido(id: string) {
    const usuario = await this.usuarios.buscarPorId(id);
    if (!usuario || !usuario.activo) throw new UnauthorizedException('La sesión ya no es válida');
    return usuario;
  }

  private firmar(usuario: UsuarioDocument) {
    return this.jwt.sign({ sub: usuario.id, nombreUsuario: usuario.nombreUsuario, perfil: usuario.perfil });
  }

  private respuesta(usuario: UsuarioDocument) {
    return { usuario: this.usuarios.sinPassword(usuario), token: this.firmar(usuario) };
  }
}