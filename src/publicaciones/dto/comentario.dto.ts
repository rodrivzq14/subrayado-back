import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ComentarioDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'El comentario debe ser un texto' })
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  @MaxLength(500, { message: 'El comentario puede tener hasta 500 caracteres' })
  mensaje: string;
}