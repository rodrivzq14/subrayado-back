import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';

@Module({
  imports: [
    UsuariosModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        secret: c.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AutenticacionController],
  providers: [AutenticacionService],
  exports: [JwtModule],
})
export class AutenticacionModule {}