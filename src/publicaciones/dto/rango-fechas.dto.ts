import { EsFecha } from '../../common/es-fecha.validator';

export class RangoFechasDto {
  @EsFecha({}, { message: 'desde debe ser una fecha real con formato AAAA-MM-DD' }) desde: string;
  @EsFecha({}, { message: 'hasta debe ser una fecha real con formato AAAA-MM-DD' }) hasta: string;
}
