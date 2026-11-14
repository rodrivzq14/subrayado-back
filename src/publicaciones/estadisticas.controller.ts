import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../autenticacion/admin.guard';
import { JwtAuthGuard } from '../autenticacion/jwt-auth.guard';
import { RangoFechasDto } from './dto/rango-fechas.dto';
import { EstadisticasService } from './estadisticas.service';

@Controller('estadisticas')
@UseGuards(JwtAuthGuard, AdminGuard)
export class EstadisticasController {
  constructor(private servicio: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query() rango: RangoFechasDto) {
    return this.servicio.publicacionesPorUsuario(rango);
  }

  @Get('comentarios-por-dia')
  comentariosPorDia(@Query() rango: RangoFechasDto) {
    return this.servicio.comentariosPorDia(rango);
  }

  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query() rango: RangoFechasDto) {
    return this.servicio.comentariosPorPublicacion(rango);
  }
}
