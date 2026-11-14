import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { EsFecha } from '../../common/es-fecha.validator';

export class RegistroDto {
  @IsString() @IsNotEmpty() nombre: string;
  @IsString() @IsNotEmpty() apellido: string;
  @IsEmail() correo: string;
  @IsString() @IsNotEmpty() nombreUsuario: string;

  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número',
  })
  password: string;

  @EsFecha({ noFutura: true }, { message: 'La fecha de nacimiento debe ser una fecha real (AAAA-MM-DD) y no puede ser futura' })
  fechaNacimiento: string;
  @IsOptional() @IsString() @MaxLength(300) descripcion?: string;
  @IsOptional() @IsIn(['usuario', 'administrador']) perfil?: string;
}