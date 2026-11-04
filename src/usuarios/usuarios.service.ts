import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema';

@Injectable()
export class UsuariosService {
  constructor(@InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>) {}

  buscarPorCorreoOUsuario(identificador: string) {
    return this.usuarioModel.findOne({
      $or: [{ correo: identificador.toLowerCase() }, { nombreUsuario: identificador }],
    });
  }

  crear(datos: Partial<Usuario>) {
    return this.usuarioModel.create(datos);
  }

  buscarPorId(id: string) {
    return this.usuarioModel.findById(id);
  }
}