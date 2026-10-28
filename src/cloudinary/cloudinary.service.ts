import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Archivo } from '../common/archivo';

@Injectable()
export class CloudinaryService {
  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  subir(archivo: Archivo, carpeta: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: `subrayado/${carpeta}` }, (err, res) => {
          if (err || !res) return reject(err ?? new Error('No se pudo subir la imagen'));
          resolve(res.secure_url);
        })
        .end(archivo.buffer);
    });
  }
}