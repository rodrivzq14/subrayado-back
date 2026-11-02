import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';
import { Publicacion, PublicacionSchema } from './schemas/publicacion.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Publicacion.name, schema: PublicacionSchema }]),
    AutenticacionModule,
  ],
  controllers: [PublicacionesController],
  providers: [PublicacionesService],
})
export class PublicacionesModule {}