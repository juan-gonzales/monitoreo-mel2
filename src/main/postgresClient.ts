import { Pool, PoolClient } from 'pg';
import QueryStream from 'pg-query-stream';

export interface ParametrosDeConsulta {
  fechaInicioIso: string;
  fechaFinIso: string;
}

export interface RegistroCrudo {
  fecha: string;
  accion: string;
  tiempo: number | string;
}

export interface ConfiguracionBaseDeDatos {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

/**
 * Construye el pool de conexiones a PostgreSQL usando variables de entorno.
 * Separa la configuración del resto de la lógica para facilitar la depuración y el despliegue.
 * Impacta en la estabilidad de la aplicación porque centraliza la reutilización de conexiones.
 */
export function construirPoolDeBaseDeDatos(
  configuracion?: Partial<ConfiguracionBaseDeDatos>
): Pool {
  return new Pool({
    host: configuracion?.host || process.env.POSTGRES_HOST || 'localhost',
    port: Number(configuracion?.port ?? process.env.POSTGRES_PORT ?? 5432),
    user: configuracion?.user || process.env.POSTGRES_USER || 'postgres',
    password: configuracion?.password ?? process.env.POSTGRES_PASSWORD ?? 'postgres',
    database: configuracion?.database || process.env.POSTGRES_DATABASE || 'monitoreo',
    max: 1,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: { rejectUnauthorized: false }
  });
}

/**
 * Ejecuta una consulta de logs por rango de fechas usando streaming interno.
 * Devuelve los registros crudos sin transformar para que el renderer realice el procesamiento pesado.
 * Impacta en la eficiencia de memoria del proceso principal al evitar cargar millones de registros de una sola vez.
 */
export async function consultarLogsPorRangoDeFechas(
  pool: Pool,
  { fechaInicioIso, fechaFinIso }: ParametrosDeConsulta
): Promise<RegistroCrudo[]> {
  const cliente: PoolClient = await pool.connect();
  const registrosAcumulados: RegistroCrudo[] = [];

  // Consulta directa en SQL, ordenada por tiempo para facilitar el cálculo por minuto en el renderer.
  const consultaSql = `
    SELECT fecha, accion, tiempo
    FROM mel2.logacciones
    WHERE fecha >= $1 AND fecha <= $2
    ORDER BY fecha ASC
  `;

  const flujoDeConsulta = new QueryStream(consultaSql, [fechaInicioIso, fechaFinIso], {
    highWaterMark: 500
  });

  try {
    const streamDeResultados = cliente.query(flujoDeConsulta);

    await new Promise<void>((resolve, reject) => {
      streamDeResultados.on('data', (fila: RegistroCrudo) => {
        
        registrosAcumulados.push({
          fecha: fila.fecha,
          accion: fila.accion,
          tiempo: fila.tiempo
        });
      });

      streamDeResultados.on('error', (error: Error) => {
        reject(error);
      });

      streamDeResultados.on('end', () => {
        resolve();
      });
    });
  } finally {
    flujoDeConsulta.destroy();
    cliente.release();
  }

  return registrosAcumulados;
}
