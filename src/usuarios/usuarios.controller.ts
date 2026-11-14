import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from '../autenticacion/admin.guard';
import { RegistroDto } from '../autenticacion/dto/registro.dto';
import { JwtAuthGuard } from '../autenticacion/jwt-auth.guard';
import { UsuarioActual, UsuarioToken } from '../autenticacion/usuario-actual.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Archivo } from '../common/archivo';
import { ObjectIdPipe } from '../common/object-id.pipe';
import { opcionesImagen } from '../common/opciones-imagen';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
  constructor(
    private servicio: UsuariosService,
    private cloudinary: CloudinaryService,
  ) {}

  @Put('mi-perfil')
  @UseInterceptors(FileInterceptor('imagenPerfil', opcionesImagen))
  async actualizarPerfil(
    @Body() dto: ActualizarPerfilDto,
    @UploadedFile() archivo: Archivo | undefined,
    @UsuarioActual() usuario: UsuarioToken,
  ) {
    const url = archivo ? await this.cloudinary.subir(archivo, 'perfiles') : undefined;
    return this.servicio.actualizarPerfil(usuario.id, dto, url);
  }

  @Get()
  @UseGuards(AdminGuard)
  listar() {
    return this.servicio.listar();
  }

  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('imagenPerfil', opcionesImagen))
  async crear(@Body() dto: RegistroDto, @UploadedFile() archivo?: Archivo) {
    const url = archivo ? await this.cloudinary.subir(archivo, 'perfiles') : undefined;
    const usuario = await this.servicio.registrar(dto, url);
    return this.servicio.sinPassword(usuario);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async deshabilitar(@Param('id', ObjectIdPipe) id: string, @UsuarioActual() admin: UsuarioToken) {
    const usuario = await this.servicio.cambiarEstado(id, false, admin.id);
    return { mensaje: 'Usuario deshabilitado', usuario };
  }

  @Post(':id/habilitar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  async habilitar(@Param('id', ObjectIdPipe) id: string, @UsuarioActual() admin: UsuarioToken) {
    const usuario = await this.servicio.cambiarEstado(id, true, admin.id);
    return { mensaje: 'Usuario habilitado', usuario };
  }
}
