const { Pool } = require('pg');
const QueryStream = require('pg-query-stream');

/**
 * Construye el pool de conexiones a PostgreSQL usando variables de entorno.
 * Separa la configuración del resto de la lógica para facilitar la depuración y el despliegue.
 * Impacta en la estabilidad de la aplicación porque centraliza la reutilización de conexiones.
 */
function construirPoolDeBaseDeDatos() {
  return new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DATABASE || 'monitoreo',
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000
  });
}

/**
 * Ejecuta una consulta de logs por rango de fechas usando streaming interno.
 * Devuelve los registros crudos sin transformar para que el renderer realice el procesamiento pesado.
 * Impacta en la eficiencia de memoria del proceso principal al evitar cargar millones de registros de una sola vez.
 */
async function consultarLogsPorRangoDeFechas(pool, { fechaInicioIso, fechaFinIso }) {
  const cliente = await pool.connect();
  const registrosAcumulados = [];

  // Consulta directa en SQL, ordenada por tiempo para facilitar el cálculo por minuto en el renderer.
  const consultaSql = `
    SELECT fecha_evento, accion, tiempo
    FROM logs
    WHERE fecha_evento >= $1 AND fecha_evento <= $2
    ORDER BY fecha_evento ASC
  `;

  const flujoDeConsulta = new QueryStream(consultaSql, [fechaInicioIso, fechaFinIso], {
    highWaterMark: 500
  });

  try {
    const streamDeResultados = cliente.query(flujoDeConsulta);

    await new Promise((resolve, reject) => {
      streamDeResultados.on('data', (fila) => {
        registrosAcumulados.push({
          fecha_evento: fila.fecha_evento,
          accion: fila.accion,
          tiempo: fila.tiempo
        });
      });

      streamDeResultados.on('error', (error) => {
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

module.exports = {
  construirPoolDeBaseDeDatos,
  consultarLogsPorRangoDeFechas
};
