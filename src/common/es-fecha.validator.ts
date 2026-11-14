import { ValidationOptions, registerDecorator } from 'class-validator';

const FORMATO = /^(\d{4})-(\d{2})-(\d{2})$/;

export function esFechaReal(valor: unknown) {
  if (typeof valor !== 'string') return false;
  const partes = FORMATO.exec(valor);
  if (!partes) return false;
  const [anio, mes, dia] = partes.slice(1).map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  return fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia;
}

export function EsFecha(config: { noFutura?: boolean } = {}, opciones?: ValidationOptions) {
  return (objeto: object, propiedad: string) =>
    registerDecorator({
      name: 'esFecha',
      target: objeto.constructor,
      propertyName: propiedad,
      options: opciones,
      validator: {
        validate(valor: unknown) {
          if (!esFechaReal(valor)) return false;
          return !config.noFutura || new Date(`${valor}T00:00:00Z`).getTime() <= Date.now();
        },
        defaultMessage: () => `${propiedad} debe ser una fecha real con formato AAAA-MM-DD`,
      },
    });
}
