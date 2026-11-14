import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RangoFechasDto } from './dto/rango-fechas.dto';
import { Comentario, ComentarioDocument } from './schemas/comentario.schema';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';

const ZONA = 'America/Argentina/Buenos_Aires';
const DIA = 24 * 60 * 60 * 1000;
const MAX_DIAS = 366;
const MAX_PORCIONES = 8;

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private publicaciones: Model<PublicacionDocument>,
    @InjectModel(Comentario.name) private comentarios: Model<ComentarioDocument>,
  ) {}

  async publicacionesPorUsuario(rango: RangoFechasDto) {
    const { inicio, fin } = this.rango(rango);
    return this.publicaciones.aggregate([
      { $match: { activo: true, createdAt: { $gte: inicio, $lte: fin } } },
      { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
      { $lookup: { from: 'usuarios', localField: '_id', foreignField: '_id', as: 'autor' } },
      { $unwind: '$autor' },
      { $project: { _id: 0, usuario: '$autor.nombreUsuario', cantidad: 1 } },
      { $sort: { cantidad: -1, usuario: 1 } },
    ]);
  }

  async comentariosPorDia(rango: RangoFechasDto) {
    const { inicio, fin } = this.rango(rango);
    const porDia: { _id: string; cantidad: number }[] = await this.comentarios.aggregate([
      { $match: { createdAt: { $gte: inicio, $lte: fin } } },
      ...this.soloPublicacionesActivas(),
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: ZONA } },
          cantidad: { $sum: 1 },
        },
      },
    ]);

    const cantidades = new Map(porDia.map((d) => [d._id, d.cantidad]));
    const dias: { fecha: string; cantidad: number }[] = [];
    for (let t = Date.parse(`${rango.desde}T12:00:00Z`); t <= Date.parse(`${rango.hasta}T12:00:00Z`); t += DIA) {
      const fecha = new Date(t).toISOString().slice(0, 10);
      dias.push({ fecha, cantidad: cantidades.get(fecha) ?? 0 });
    }
    return { total: dias.reduce((suma, d) => suma + d.cantidad, 0), dias };
  }

  async comentariosPorPublicacion(rango: RangoFechasDto) {
    const { inicio, fin } = this.rango(rango);
    const items: { publicacion: string; cantidad: number }[] = await this.comentarios.aggregate([
      { $match: { createdAt: { $gte: inicio, $lte: fin } } },
      ...this.soloPublicacionesActivas(),
      { $group: { _id: '$publicacion', publicacion: { $first: '$pub.titulo' }, cantidad: { $sum: 1 } } },
      { $project: { _id: 0, publicacion: 1, cantidad: 1 } },
      { $sort: { cantidad: -1, publicacion: 1 } },
    ]);

    if (items.length <= MAX_PORCIONES) return items;
    const otras = items.slice(MAX_PORCIONES - 1).reduce((suma, i) => suma + i.cantidad, 0);
    return [...items.slice(0, MAX_PORCIONES - 1), { publicacion: 'Otras', cantidad: otras }];
  }

  private soloPublicacionesActivas() {
    return [
      { $lookup: { from: 'publicacions', localField: 'publicacion', foreignField: '_id', as: 'pub' } },
      { $unwind: '$pub' },
      { $match: { 'pub.activo': true } },
    ];
  }

  private rango({ desde, hasta }: RangoFechasDto) {
    const inicio = new Date(`${desde}T00:00:00-03:00`);
    const fin = new Date(`${hasta}T23:59:59.999-03:00`);
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) throw new BadRequestException('Las fechas no son válidas');
    if (inicio > fin) throw new BadRequestException('La fecha desde no puede ser posterior a hasta');
    if (fin.getTime() - inicio.getTime() > MAX_DIAS * DIA) {
      throw new BadRequestException(`El lapso puede ser de hasta ${MAX_DIAS} días`);
    }
    return { inicio, fin };
  }
}
