import { BadRequestException } from '@nestjs/common';

export const opcionesImagen = {
  fileFilter: (_req: unknown, file: { mimetype: string }, cb: (error: Error | null, aceptar: boolean) => void) =>
    file.mimetype.startsWith('image/')
      ? cb(null, true)
      : cb(new BadRequestException('El archivo debe ser una imagen'), false),
  limits: { fileSize: 5 * 1024 * 1024 },
};
