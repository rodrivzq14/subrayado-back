import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ComentarioDto } from './dto/comentario.dto';
import { ListarComentariosDto } from './dto/listar-comentarios.dto';
import { Comentario, ComentarioDocument } from './schemas/comentario.schema';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';

const CAMPOS_AUTOR = 'nombre apellido nombreUsuario imagenPerfil perfil';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name) private comentarios: Model<ComentarioDocument>,
    @InjectModel(Publicacion.name) private publicaciones: Model<PublicacionDocument>,
  ) {}

  async listar(publicacionId: string, q: ListarComentariosDto) {
    await this.verificarPublicacion(publicacionId);
    const filtro = { publicacion: new Types.ObjectId(publicacionId) };

    const [items, total] = await Promise.all([
      this.comentarios
        .find(filtro)
        .sort({ createdAt: -1, _id: -1 })
        .skip(q.offset)
        .limit(q.limit)
        .populate('autor', CAMPOS_AUTOR)
        .lean(),
      this.comentarios.countDocuments(filtro),
    ]);

    return { items, total, offset: q.offset, limit: q.limit };
  }

  async crear(publicacionId: string, dto: ComentarioDto, autorId: string) {
    await this.verificarPublicacion(publicacionId);

    const comentario = await this.comentarios.create({
      mensaje: dto.mensaje,
      autor: new Types.ObjectId(autorId),
      publicacion: new Types.ObjectId(publicacionId),
    });
    await this.publicaciones.updateOne({ _id: publicacionId }, { $inc: { cantidadComentarios: 1 } });

    await comentario.populate('autor', CAMPOS_AUTOR);
    return comentario.toObject();
  }

  async editar(publicacionId: string, id: string, dto: ComentarioDto, usuarioId: string) {
    await this.verificarPublicacion(publicacionId);

    const comentario = await this.comentarios.findOne({ _id: id, publicacion: publicacionId });
    if (!comentario) throw new NotFoundException('El comentario no existe');
    if (comentario.autor.toString() !== usuarioId) {
      throw new ForbiddenException('Solo podés editar tus propios comentarios');
    }

    // Si el texto no cambió, no se marca como modificado
    if (comentario.mensaje !== dto.mensaje) {
      comentario.mensaje = dto.mensaje;
      comentario.modificado = true;
      await comentario.save();
    }

    await comentario.populate('autor', CAMPOS_AUTOR);
    return comentario.toObject();
  }

  // Una reseña dada de baja deja de mostrar sus comentarios
  private async verificarPublicacion(id: string) {
    const existe = await this.publicaciones.exists({ _id: id, activo: true });
    if (!existe) throw new NotFoundException('La reseña no existe');
  }
}