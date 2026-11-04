import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { ComentariosController } from './comentarios.controller';
import { ComentariosService } from './comentarios.service';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';
import { Comentario, ComentarioSchema } from './schemas/comentario.schema';
import { Publicacion, PublicacionSchema } from './schemas/publicacion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
    AutenticacionModule,
  ],
  controllers: [PublicacionesController, ComentariosController],
  providers: [PublicacionesService, ComentariosService],
})
export class PublicacionesModule {}