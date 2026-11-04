import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../autenticacion/jwt-auth.guard';
import { UsuarioActual, UsuarioToken } from '../autenticacion/usuario-actual.decorator';
import { ObjectIdPipe } from '../common/object-id.pipe';
import { ComentariosService } from './comentarios.service';
import { ComentarioDto } from './dto/comentario.dto';
import { ListarComentariosDto } from './dto/listar-comentarios.dto';

@Controller('publicaciones/:publicacionId/comentarios')
@UseGuards(JwtAuthGuard)
export class ComentariosController {
  constructor(private servicio: ComentariosService) {}

  @Get()
  listar(
    @Param('publicacionId', ObjectIdPipe) publicacionId: string,
    @Query() query: ListarComentariosDto,
  ) {
    return this.servicio.listar(publicacionId, query);
  }

  @Post()
  crear(
    @Param('publicacionId', ObjectIdPipe) publicacionId: string,
    @Body() dto: ComentarioDto,
    @UsuarioActual() usuario: UsuarioToken,
  ) {
    return this.servicio.crear(publicacionId, dto, usuario.id);
  }

  @Put(':id')
  editar(
    @Param('publicacionId', ObjectIdPipe) publicacionId: string,
    @Param('id', ObjectIdPipe) id: string,
    @Body() dto: ComentarioDto,
    @UsuarioActual() usuario: UsuarioToken,
  ) {
    return this.servicio.editar(publicacionId, id, dto, usuario.id);
  }
}