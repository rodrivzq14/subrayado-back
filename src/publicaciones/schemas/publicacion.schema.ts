import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type PublicacionDocument = HydratedDocument<Publicacion>;

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ required: true, trim: true }) titulo: string;
  @Prop({ required: true, trim: true }) mensaje: string;
  @Prop({ default: '' }) imagen: string;
  @Prop({ type: Number, min: 1, max: 5 }) calificacion?: number;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Usuario', required: true, index: true })
    autor: Types.ObjectId;
  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] }) meGusta: Types.ObjectId[];
  @Prop({ default: 0, index: true }) cantidadMeGusta: number;
  @Prop({ default: true }) activo: boolean;
  @Prop({ default: 0 }) cantidadComentarios: number;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);