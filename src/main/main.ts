import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import dotenv from 'dotenv';
import {
  construirPoolDeBaseDeDatos,
  consultarLogsPorRangoDeFechas,
  ParametrosDeConsulta
} from './postgresClient';

// Carga .env desde la raíz del proyecto en desarrollo y junto al ejecutable en producción portable.
const appRoot = app.isPackaged ? path.dirname(process.execPath) : path.join(__dirname, '../..');
dotenv.config({ path: path.join(appRoot, '.env') });

// Pool de conexión compartido para toda la aplicación principal.
const poolDeBaseDeDatos = construirPoolDeBaseDeDatos();

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

    const registrosCrudos = await consultarLogsPorRangoDeFechas(poolDeBaseDeDatos, {
      fechaInicioIso,
      fechaFinIso
    });

    return { registrosCrudos };
  });
}

app.whenReady().then((): void => {
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
