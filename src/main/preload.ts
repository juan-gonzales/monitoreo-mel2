import { contextBridge, ipcRenderer } from 'electron';
import {
  ParametrosDeConsulta,
  RegistroCrudo,
  ParametrosDetalleLogs,
  RegistroDetalleAccion,
  RegistroDetalleEvento
} from './postgresClient';

type ConfiguracionDeEnv = {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
};

type RespuestaConfiguracion = {
  configuracion: ConfiguracionDeEnv;
  existeArchivoEnv: boolean;
};

type RespuestaDetalle = {
  acciones: RegistroDetalleAccion[];
  eventos: RegistroDetalleEvento[];
};

/**
 * Expone una API mínima al renderer para ejecutar consultas bajo demanda.
 * Mantiene el aislamiento de contexto y evita que el frontend acceda directamente a Node o a las credenciales.
 * Impacta en la seguridad del proyecto al definir explícitamente las funciones disponibles en la UI.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  ejecutarConsultaDeLogs: (fechas: ParametrosDeConsulta): Promise<{ registrosCrudos: RegistroCrudo[] }> =>
    ipcRenderer.invoke('execute-log-query', fechas),
  obtenerConfiguracionDeEnv: (): Promise<RespuestaConfiguracion> => ipcRenderer.invoke('get-env-config'),
  guardarConfiguracionDeEnv: (configuracion: ConfiguracionDeEnv): Promise<RespuestaConfiguracion> =>
    ipcRenderer.invoke('save-env-config', configuracion),
  consultarDetalleDeLogs: (filtros: ParametrosDetalleLogs): Promise<RespuestaDetalle> =>
    ipcRenderer.invoke('execute-log-detail', filtros)
});
