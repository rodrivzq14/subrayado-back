import { IsDateString, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class RegistroDto {
  @IsString() @IsNotEmpty() nombre: string;
  @IsString() @IsNotEmpty() apellido: string;
  @IsEmail() correo: string;
  @IsString() @IsNotEmpty() nombreUsuario: string;

  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número',
  })
  password: string;

  @IsDateString() fechaNacimiento: string;
  @IsOptional() @IsString() @MaxLength(300) descripcion?: string;
  @IsOptional() @IsIn(['usuario', 'administrador']) perfil?: string;
}