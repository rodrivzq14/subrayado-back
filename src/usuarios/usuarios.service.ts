import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { RegistroDto } from '../autenticacion/dto/registro.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';

@Injectable()
export class UsuariosService {
  constructor(@InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>) {}

  buscarPorCorreoOUsuario(identificador: string) {
    return this.usuarioModel.findOne({
      $or: [{ correo: identificador.toLowerCase() }, { nombreUsuario: identificador }],
    });
  }

  buscarPorId(id: string) {
    return this.usuarioModel.findById(id);
  }

  async registrar(dto: RegistroDto, imagenPerfil?: string) {
    const existente =
      (await this.buscarPorCorreoOUsuario(dto.correo)) ??
      (await this.buscarPorCorreoOUsuario(dto.nombreUsuario));
    if (existente) throw new ConflictException('El correo o el nombre de usuario ya están registrados');

    const hash = await bcrypt.hash(dto.password, 10);
    return this.usuarioModel.create({
      ...dto,
      password: hash,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      imagenPerfil: imagenPerfil ?? '',
    });
  }

  listar() {
    return this.usuarioModel.find().select('-password').sort({ createdAt: -1 }).lean();
  }

  async cambiarEstado(id: string, activo: boolean, adminId: string) {
    if (!activo && id === adminId) throw new BadRequestException('No podés deshabilitar tu propio usuario');

    const usuario = await this.usuarioModel
      .findByIdAndUpdate(id, { activo }, { returnDocument: 'after' })
      .select('-password')
      .lean();
    if (!usuario) throw new NotFoundException('El usuario no existe');
    return usuario;
  }

  async actualizarPerfil(id: string, dto: ActualizarPerfilDto, imagenPerfil?: string) {
    const { fechaNacimiento, ...resto } = dto;
    const cambios: Partial<Usuario> = { ...resto };
    if (fechaNacimiento) cambios.fechaNacimiento = new Date(fechaNacimiento);
    if (imagenPerfil) cambios.imagenPerfil = imagenPerfil;

    const usuario = await this.usuarioModel
      .findByIdAndUpdate(id, cambios, { returnDocument: 'after', runValidators: true })
      .select('-password')
      .lean();
    if (!usuario) throw new NotFoundException('El usuario no existe');
    return usuario;
  }

  sinPassword(usuario: UsuarioDocument) {
    const { password, ...datos } = usuario.toObject();
    return datos;
  }
}
