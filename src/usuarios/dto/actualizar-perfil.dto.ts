import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { EsFecha } from '../../common/es-fecha.validator';

export class ActualizarPerfilDto {
  @IsOptional() @IsString() @IsNotEmpty() nombre?: string;
  @IsOptional() @IsString() @IsNotEmpty() apellido?: string;

  @IsOptional()
  @EsFecha({ noFutura: true }, { message: 'La fecha de nacimiento debe ser una fecha real (AAAA-MM-DD) y no puede ser futura' })
  fechaNacimiento?: string;

  @IsOptional() @IsString() @MaxLength(300) descripcion?: string;
}
