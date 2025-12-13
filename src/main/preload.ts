import { contextBridge, ipcRenderer } from 'electron';
import { ParametrosDeConsulta, RegistroCrudo } from './postgresClient';

/**
 * Expone una API mínima al renderer para ejecutar consultas bajo demanda.
 * Mantiene el aislamiento de contexto y evita que el frontend acceda directamente a Node o a las credenciales.
 * Impacta en la seguridad del proyecto al definir explícitamente las funciones disponibles en la UI.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  ejecutarConsultaDeLogs: (fechas: ParametrosDeConsulta): Promise<{ registrosCrudos: RegistroCrudo[] }> =>
    ipcRenderer.invoke('execute-log-query', fechas)
});
