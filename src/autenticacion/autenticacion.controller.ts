import {
  Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AutenticacionService } from './autenticacion.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsuarioActual, UsuarioToken } from './usuario-actual.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Archivo } from '../common/archivo';
import { opcionesImagen } from '../common/opciones-imagen';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(
    private servicio: AutenticacionService,
    private cloudinary: CloudinaryService,
  ) {}

  @Post('registro')
  @UseInterceptors(FileInterceptor('imagenPerfil', opcionesImagen))
  async registro(@Body() dto: RegistroDto, @UploadedFile() archivo?: Archivo) {
    const url = archivo ? await this.cloudinary.subir(archivo, 'perfiles') : undefined;
    return this.servicio.registro(dto, url);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.servicio.login(dto);
  }

  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  autorizar(@UsuarioActual() usuario: UsuarioToken) {
    return this.servicio.autorizar(usuario.id);
  }

  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  refrescar(@UsuarioActual() usuario: UsuarioToken) {
    return this.servicio.refrescar(usuario.id);
  }
}