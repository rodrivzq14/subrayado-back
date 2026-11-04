import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsuarioToken } from '../autenticacion/usuario-actual.decorator';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';

const CAMPOS_AUTOR = 'nombre apellido nombreUsuario imagenPerfil perfil';

@Injectable()
export class PublicacionesService {
  constructor(@InjectModel(Publicacion.name) private modelo: Model<PublicacionDocument>) {}

  async crear(dto: CrearPublicacionDto, autorId: string, imagen?: string) {
    const publicacion = await this.modelo.create({
      ...dto,
      autor: new Types.ObjectId(autorId),
      imagen: imagen ?? '',
    });
    await publicacion.populate('autor', CAMPOS_AUTOR);
    return this.formatear(publicacion.toObject(), autorId);
  }

  async listar(q: ListarPublicacionesDto, usuarioId: string) {
    const filtro: Record<string, unknown> = { activo: true };
    if (q.usuario) filtro.autor = new Types.ObjectId(q.usuario);

    const orden: Record<string, 1 | -1> =
      q.orden === 'meGusta' ? { cantidadMeGusta: -1, createdAt: -1 } : { createdAt: -1 };

    const [items, total] = await Promise.all([
      this.modelo.find(filtro).sort(orden).skip(q.offset).limit(q.limit).populate('autor', CAMPOS_AUTOR).lean(),
      this.modelo.countDocuments(filtro),
    ]);

    return { items: items.map((p) => this.formatear(p, usuarioId)), total, offset: q.offset, limit: q.limit };
  }

  async eliminar(id: string, usuario: UsuarioToken) {
    const publicacion = await this.modelo.findOne({ _id: id, activo: true });
    if (!publicacion) throw new NotFoundException('La reseña no existe');

    const esAutor = publicacion.autor.toString() === usuario.id;
    if (!esAutor && usuario.perfil !== 'administrador') {
      throw new ForbiddenException('Solo podés eliminar tus propias reseñas');
    }

    publicacion.activo = false;
    await publicacion.save();
    return { mensaje: 'Reseña eliminada' };
  }

  async darMeGusta(id: string, usuarioId: string) {
    const actualizada = await this.modelo.findOneAndUpdate(
      { _id: id, activo: true, meGusta: { $ne: usuarioId } },
      { $addToSet: { meGusta: usuarioId }, $inc: { cantidadMeGusta: 1 } },
      { new: true },
    );
    if (!actualizada) {
      await this.verificarExiste(id);
      throw new ConflictException('Ya le diste me gusta a esta reseña');
    }
    return { cantidadMeGusta: actualizada.cantidadMeGusta, yaLeGusto: true };
  }

  async quitarMeGusta(id: string, usuarioId: string) {
    const actualizada = await this.modelo.findOneAndUpdate(
      { _id: id, activo: true, meGusta: usuarioId },
      { $pull: { meGusta: usuarioId }, $inc: { cantidadMeGusta: -1 } },
      { new: true },
    );
    if (!actualizada) {
      await this.verificarExiste(id);
      throw new ConflictException('Todavía no le diste me gusta a esta reseña');
    }
    return { cantidadMeGusta: actualizada.cantidadMeGusta, yaLeGusto: false };
  }

  private async verificarExiste(id: string) {
    const existe = await this.modelo.exists({ _id: id, activo: true });
    if (!existe) throw new NotFoundException('La reseña no existe');
  }

  // Saca los datos internos y agrega si el usuario actual ya dio me gusta
  private formatear(p: any, usuarioId: string) {
  const { meGusta, activo, __v, ...resto } = p;
  return {
    ...resto,
    cantidadComentarios: p.cantidadComentarios ?? 0,
    yaLeGusto: meGusta.some((id: Types.ObjectId) => id.toString() === usuarioId),
  };
}
  async obtener(id: string, usuarioId: string) {
  const publicacion = await this.modelo
    .findOne({ _id: id, activo: true })
    .populate('autor', CAMPOS_AUTOR)
    .lean();
  if (!publicacion) throw new NotFoundException('La reseña no existe');
  return this.formatear(publicacion, usuarioId);
}
}