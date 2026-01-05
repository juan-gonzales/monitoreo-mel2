import { app, BrowserWindow, ipcMain } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import {
  construirPoolDeBaseDeDatos,
  consultarLogsPorRangoDeFechas,
  ConfiguracionBaseDeDatos,
  ParametrosDeConsulta,
  ParametrosDetalleLogs,
  consultarLogAccionesPorIdentificadores,
  consultarLogEventosPorIdentificadores
} from './postgresClient';

// Carga .env desde la raíz del proyecto en desarrollo y junto al ejecutable en producción portable.
const appRoot = app.isPackaged ? path.dirname(process.execPath) : path.join(__dirname, '../..');
const rutaEnv = path.join(appRoot, '.env');
dotenv.config({ path: rutaEnv });

const CONFIGURACION_POR_DEFECTO: ConfiguracionBaseDeDatos = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD ?? 'postgres',
  database: process.env.POSTGRES_DATABASE || 'monitoreo'
};

type ConfiguracionBaseDeDatosEntrada = Partial<
  Omit<ConfiguracionBaseDeDatos, 'port'> & { port?: string | number }
>;

function normalizarConfiguracion(
  configuracion: ConfiguracionBaseDeDatosEntrada
): ConfiguracionBaseDeDatos {
  const puerto = Number(configuracion.port ?? CONFIGURACION_POR_DEFECTO.port);

  return {
    host: configuracion.host?.toString().trim() || CONFIGURACION_POR_DEFECTO.host,
    port: Number.isFinite(puerto) && puerto > 0 ? puerto : CONFIGURACION_POR_DEFECTO.port,
    user: configuracion.user?.toString().trim() || CONFIGURACION_POR_DEFECTO.user,
    password:
      configuracion.password !== undefined ? configuracion.password : CONFIGURACION_POR_DEFECTO.password,
    database: configuracion.database?.toString().trim() || CONFIGURACION_POR_DEFECTO.database
  };
}

function prepararConfiguracionParaRenderer(
  configuracion: ConfiguracionBaseDeDatos
): ConfiguracionBaseDeDatosEntrada {
  return {
    ...configuracion,
    port: configuracion.port.toString()
  };
}

let configuracionEnMemoria: ConfiguracionBaseDeDatos = { ...CONFIGURACION_POR_DEFECTO };
let existeArchivoEnv = false;

function actualizarVariablesDeProceso(configuracion: ConfiguracionBaseDeDatos): void {
  process.env.POSTGRES_HOST = configuracion.host;
  process.env.POSTGRES_PORT = configuracion.port.toString();
  process.env.POSTGRES_USER = configuracion.user;
  process.env.POSTGRES_PASSWORD = configuracion.password;
  process.env.POSTGRES_DATABASE = configuracion.database;
}

function normalizarParametrosDetalle(
  filtros: ParametrosDetalleLogs | undefined
): ParametrosDetalleLogs {
  return {
    idTransaccion: filtros?.idTransaccion?.toString().trim() ?? '',
    idSession: filtros?.idSession?.toString().trim() ?? ''
  };
}

async function cargarConfiguracionInicial(): Promise<void> {
  try {
    const contenido = await fs.readFile(rutaEnv, 'utf-8');
    const valores = dotenv.parse(contenido);
    configuracionEnMemoria = normalizarConfiguracion({
      host: valores.POSTGRES_HOST,
      port: valores.POSTGRES_PORT,
      user: valores.POSTGRES_USER,
      password: valores.POSTGRES_PASSWORD ?? '',
      database: valores.POSTGRES_DATABASE
    });
    existeArchivoEnv = true;
    actualizarVariablesDeProceso(configuracionEnMemoria);
  } catch (error) {
    const codigo = error instanceof Error && 'code' in error ? (error as { code?: string }).code : undefined;
    if (codigo !== 'ENOENT') {
      console.warn('No se pudo leer .env, se usará la configuración por defecto en memoria.', error);
    }
    configuracionEnMemoria = { ...CONFIGURACION_POR_DEFECTO };
    existeArchivoEnv = false;
    actualizarVariablesDeProceso(configuracionEnMemoria);
  }
}

/**
 * Crea la ventana principal de la aplicación con la configuración de seguridad recomendada.
 * Sirve como contenedor del dashboard y del resto de secciones de la UI.
 * Impacta en la experiencia del usuario porque habilita la carga del renderer y la comunicación segura con el proceso principal.
 */
function crearVentanaPrincipal(): void {
  const ventanaPrincipal = new BrowserWindow({
    width: 1280,
    height: 840,
    backgroundColor: '#f5f5f5',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  ventanaPrincipal.loadFile(path.join(__dirname, '../renderer/index.html'));
  ventanaPrincipal.maximize();
}

/**
 * Registra los manejadores de IPC que conectan la UI con la base de datos.
 * Permite que el renderer consulte los logs bajo demanda sin exponer credenciales ni lógica de conexión.
 * Impacta en la interacción de la UI con los datos porque es el único punto de entrada a la obtención de información.
 */
function registrarManejadoresDeIPC(): void {
  ipcMain.handle('execute-log-query', async (_event, parametrosDeConsulta: ParametrosDeConsulta) => {
    const { fechaInicioIso, fechaFinIso } = parametrosDeConsulta;

    const fechaInicio = new Date(fechaInicioIso);
    const fechaFin = new Date(fechaFinIso);

    if (Number.isNaN(fechaInicio.getTime()) || Number.isNaN(fechaFin.getTime())) {
      throw new Error('Las fechas proporcionadas no tienen un formato válido.');
    }

    if (fechaFin < fechaInicio) {
      throw new Error('La fecha fin no puede ser anterior a la fecha inicio.');
    }

    const pool = construirPoolDeBaseDeDatos(configuracionEnMemoria);
    try {
      const registrosCrudos = await consultarLogsPorRangoDeFechas(pool, {
        fechaInicioIso,
        fechaFinIso
      });

      return { registrosCrudos };
    } finally {
      await pool.end();
    }
  });

  ipcMain.handle('execute-log-detail', async (_event, filtros: ParametrosDetalleLogs) => {
    const filtrosNormalizados = normalizarParametrosDetalle(filtros);
    if (!filtrosNormalizados.idTransaccion && !filtrosNormalizados.idSession) {
      throw new Error('Indica idTransaccion o idSession para consultar el detalle.');
    }

    const pool = construirPoolDeBaseDeDatos(configuracionEnMemoria);
    const cliente = await pool.connect();
    try {
      const acciones = await consultarLogAccionesPorIdentificadores(cliente, filtrosNormalizados);
      const eventos = await consultarLogEventosPorIdentificadores(cliente, filtrosNormalizados);
      return { acciones, eventos };
    } finally {
      cliente.release();
      await pool.end();
    }
  });

  ipcMain.handle('get-env-config', async () => {
    return {
      configuracion: prepararConfiguracionParaRenderer(configuracionEnMemoria),
      existeArchivoEnv
    };
  });

  ipcMain.handle('save-env-config', async (_event, configuracionRecibida: ConfiguracionBaseDeDatosEntrada) => {
    const configuracionNormalizada = normalizarConfiguracion(configuracionRecibida);
    configuracionEnMemoria = configuracionNormalizada;
    actualizarVariablesDeProceso(configuracionEnMemoria);
    return {
      configuracion: prepararConfiguracionParaRenderer(configuracionEnMemoria),
      existeArchivoEnv
    };
  });
}

app.whenReady().then(async (): Promise<void> => {
  await cargarConfiguracionInicial();
  registrarManejadoresDeIPC();
  crearVentanaPrincipal();

  app.on('activate', (): void => {
    if (BrowserWindow.getAllWindows().length === 0) {
      crearVentanaPrincipal();
    }
  });
});

app.on('window-all-closed', (): void => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
