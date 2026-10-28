import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true }) nombre: string;
  @Prop({ required: true }) apellido: string;
  @Prop({ required: true, unique: true, lowercase: true, trim: true }) correo: string;
  @Prop({ required: true, unique: true, trim: true }) nombreUsuario: string;
  @Prop({ required: true }) password: string;
  @Prop({ required: true }) fechaNacimiento: Date;
  @Prop({ default: '' }) descripcion: string;
  @Prop({ default: '' }) imagenPerfil: string;
  @Prop({ enum: ['usuario', 'administrador'], default: 'usuario' }) perfil: string;
  @Prop({ default: true }) activo: boolean; 
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);