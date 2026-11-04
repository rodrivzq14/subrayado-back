import {
  BadRequestException, Body, Controller, Delete, Get, Param, Post, Query,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../autenticacion/jwt-auth.guard';
import { UsuarioActual, UsuarioToken } from '../autenticacion/usuario-actual.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Archivo } from '../common/archivo';
import { ObjectIdPipe } from '../common/object-id.pipe';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';
import { PublicacionesService } from './publicaciones.service';

@Controller('publicaciones')
@UseGuards(JwtAuthGuard)
export class PublicacionesController {
  constructor(
    private servicio: PublicacionesService,
    private cloudinary: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      fileFilter: (_req, file, cb) =>
        file.mimetype.startsWith('image/')
          ? cb(null, true)
          : cb(new BadRequestException('El archivo debe ser una imagen'), false),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async crear(
    @Body() dto: CrearPublicacionDto,
    @UploadedFile() archivo: Archivo | undefined,
    @UsuarioActual() usuario: UsuarioToken,
  ) {
    const url = archivo ? await this.cloudinary.subir(archivo, 'portadas') : undefined;
    return this.servicio.crear(dto, usuario.id, url);
  }

  @Get()
  listar(@Query() query: ListarPublicacionesDto, @UsuarioActual() usuario: UsuarioToken) {
    return this.servicio.listar(query, usuario.id);
  }

  @Get(':id')
  obtener(@Param('id', ObjectIdPipe) id: string, @UsuarioActual() usuario: UsuarioToken) {
    return this.servicio.obtener(id, usuario.id);
}

  @Delete(':id')
  eliminar(@Param('id', ObjectIdPipe) id: string, @UsuarioActual() usuario: UsuarioToken) {
    return this.servicio.eliminar(id, usuario);
  }

  @Post(':id/me-gusta')
  darMeGusta(@Param('id', ObjectIdPipe) id: string, @UsuarioActual() usuario: UsuarioToken) {
    return this.servicio.darMeGusta(id, usuario.id);
  }

  @Delete(':id/me-gusta')
  quitarMeGusta(@Param('id', ObjectIdPipe) id: string, @UsuarioActual() usuario: UsuarioToken) {
    return this.servicio.quitarMeGusta(id, usuario.id);
  }
}