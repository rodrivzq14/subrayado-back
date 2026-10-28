import {
  BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AutenticacionService } from './autenticacion.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Archivo } from '../common/archivo';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(
    private servicio: AutenticacionService,
    private cloudinary: CloudinaryService,
  ) {}

  @Post('registro')
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      fileFilter: (_req, file, cb) =>
        file.mimetype.startsWith('image/')
          ? cb(null, true)
          : cb(new BadRequestException('El archivo debe ser una imagen'), false),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async registro(@Body() dto: RegistroDto, @UploadedFile() archivo?: Archivo) {
    const url = archivo ? await this.cloudinary.subir(archivo, 'perfiles') : undefined;
    return this.servicio.registro(dto, url);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.servicio.login(dto);
  }
}