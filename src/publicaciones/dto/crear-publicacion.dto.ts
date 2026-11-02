import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CrearPublicacionDto {
  @IsString() @IsNotEmpty() @MaxLength(150) titulo: string;
  @IsString() @IsNotEmpty() @MaxLength(2000) mensaje: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(5)
  calificacion?: number;
}