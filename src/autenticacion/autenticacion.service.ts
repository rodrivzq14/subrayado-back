import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { UsuarioDocument } from '../usuarios/schemas/usuario.schema';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { Archivo } from '../common/archivo';

@Injectable()
export class AutenticacionService {
  constructor(private usuarios: UsuariosService, private jwt: JwtService) {}

  async registro(dto: RegistroDto, imagenPerfil?: string) {
    const existente =
      (await this.usuarios.buscarPorCorreoOUsuario(dto.correo)) ??
      (await this.usuarios.buscarPorCorreoOUsuario(dto.nombreUsuario));
    if (existente) throw new ConflictException('El correo o el nombre de usuario ya están registrados');

    const hash = await bcrypt.hash(dto.password, 10);
    const usuario = await this.usuarios.crear({
      ...dto,
      password: hash,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      imagenPerfil: imagenPerfil ?? '',
    });
    return this.respuesta(usuario);
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuarios.buscarPorCorreoOUsuario(dto.identificador);
    const ok = usuario && (await bcrypt.compare(dto.password, usuario.password));
    if (!usuario || !ok) throw new UnauthorizedException('Credenciales incorrectas');
    if (!usuario.activo) throw new UnauthorizedException('Tu usuario está deshabilitado');
    return this.respuesta(usuario);
  }

  private respuesta(usuario: UsuarioDocument) {
    const { password, ...datos } = usuario.toObject();
    const token = this.jwt.sign({ sub: usuario.id, nombreUsuario: usuario.nombreUsuario, perfil: usuario.perfil });
    return { usuario: datos, token };
  }
}