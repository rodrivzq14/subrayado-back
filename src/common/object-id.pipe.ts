import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ObjectIdPipe implements PipeTransform<string> {
  transform(valor: string) {
    if (!isValidObjectId(valor)) throw new BadRequestException('El id no es válido');
    return valor;
  }
}