// Tipos locales declarados para mantener la legibilidad del renderer sin dependencias de importación en tiempo de ejecución.
interface RegistroCrudo {
  fecha: string;
  accion: string;
  tiempo: number | string;
  id_transaccion?: string | null;
  id_sesion?: string | null;
  status?: string | null;
}

type ChartConstructor = typeof import("chart.js")["Chart"];

interface SortableOptionsLigero {
  animation?: number;
  handle?: string;
  ghostClass?: string;
  onEnd?: () => void;
}

type SortableInstance = {
  destroy: () => void;
};

// Chart y Sortable se inyectan en el ámbito global mediante los scripts UMD declarados en index.html.
declare const Chart: ChartConstructor;
declare class Sortable {
  constructor(element: HTMLElement, options?: SortableOptionsLigero);
  destroy(): void;
}

interface LogOpensearchNormalizado {
  fechaEvento: Date;
  urlService: string;
  dataMessage: string;
  codeStudent: string;
  codeEmplid: string;
  action: string;
  status: string;
  idTransaccion: string;
  idSession: string;
  message: string;
  log: string;
}

interface RegistroNormalizado {
  fechaEvento: Date;
  accion: string;
  tiempo: number;
  idTransaccion: string;
  idSesion: string;
  status: string;
  fechaCruda: string;
}

interface ConfiguracionBaseDeDatos {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
}

interface RespuestaConfiguracion {
  existeArchivoEnv: boolean;
  configuracion: ConfiguracionBaseDeDatos;
}

interface EstadoDashboard {
  registrosCrudos: RegistroNormalizado[];
  registrosFiltrados: RegistroNormalizado[];
  accionesDisponibles: string[];
}

interface EstadoOpenSearch {
  registros: LogOpensearchNormalizado[];
  registrosFiltrados: LogOpensearchNormalizado[];
  filtros: {
    urlService: string;
    dataMessage: string;
  };
}

interface LogDetalleOpensearch {
  fechaEvento: Date;
  urlService: string;
  codeStudent: string;
  codeEmplid: string;
  action: string;
  message: string;
  status: string;
  idTransaccion: string;
  idSession: string;
  data: unknown;
}

interface RegistroDetalleAccionNormalizado {
  accion: string;
  codAlumno: string;
  codUser: string;
  fecha: Date;
  message: string;
  status: string;
  tiempo: number | string;
  periodo: string;
  data: string;
}

interface RegistroDetalleEventoNormalizado {
  urlService: string;
  status: string;
  codeStudent: string;
  codeEmplid: string;
  action: string;
  message: string;
  event: string;
  duration: number | string;
  data: string;
  code: string;
  fecha: Date;
}

interface EstadoDetalleLogs {
  filtros: {
    idTransaccion: string;
    idSession: string;
  };
  opensearch: LogDetalleOpensearch[];
  logacciones: RegistroDetalleAccionNormalizado[];
  logeventos: RegistroDetalleEventoNormalizado[];
}

interface RegistroDetalleAccionBD {
  accion: string;
  cod_alumno: string | null;
  cod_user: string | null;
  fecha: string;
  message: string | null;
  status: string | null;
  tiempo: number | string | null;
  periodo: string | null;
  data: unknown;
}

interface RegistroDetalleEventoBD {
  url_service: string | null;
  status: string | null;
  code_student: string | null;
  code_emplid: string | null;
  action: string | null;
  message: string | null;
  event: string | null;
  duration: number | string | null;
  data: unknown;
  code: string | null;
  fecha: string;
}

interface ElectronAPI {
  ejecutarConsultaDeLogs: (fechas: {
    fechaInicioIso: string;
    fechaFinIso: string;
  }) => Promise<{
    registrosCrudos: RegistroCrudo[];
  }>;
  consultarDetalleDeLogs: (filtros: {
    idTransaccion?: string;
    idSession?: string;
  }) => Promise<{
    acciones: RegistroDetalleAccionBD[];
    eventos: RegistroDetalleEventoBD[];
  }>;
  obtenerConfiguracionDeEnv: () => Promise<RespuestaConfiguracion>;
  guardarConfiguracionDeEnv: (
    configuracion: ConfiguracionBaseDeDatos
  ) => Promise<RespuestaConfiguracion>;
}

interface Window {
  electronAPI: ElectronAPI;
}

const botonConsultar = document.getElementById(
  "boton-consultar"
) as HTMLButtonElement;
const botonCargarCsv = document.getElementById(
  "boton-cargar-csv"
) as HTMLButtonElement;
const inputFechaInicio = document.getElementById(
  "fecha-inicio"
) as HTMLInputElement;
const inputFechaFin = document.getElementById("fecha-fin") as HTMLInputElement;
const inputArchivoCsv = document.getElementById(
  "archivo-csv"
) as HTMLInputElement;
const contenedorEstado = document.getElementById(
  "estado-consulta"
) as HTMLDivElement;
const contenedorGraficos = document.getElementById(
  "contenedor-graficos"
) as HTMLDivElement;
const botonCopiarGraficos = document.getElementById(
  "boton-copiar-graficos"
) as HTMLButtonElement;
botonCopiarGraficos.disabled = true;
const seccionLogsErrores = document.getElementById(
  "seccion-logs-errores"
) as HTMLElement;
const inputFechaInicioOpensearch = document.getElementById(
  "opensearch-fecha-inicio"
) as HTMLInputElement;
const inputFechaFinOpensearch = document.getElementById(
  "opensearch-fecha-fin"
) as HTMLInputElement;
const botonCopiarQueryOpensearch = document.getElementById(
  "boton-copiar-query-opensearch"
) as HTMLButtonElement;
const botonPegarJson = document.getElementById(
  "boton-pegar-json"
) as HTMLButtonElement;
const botonSubirJson = document.getElementById(
  "boton-subir-json"
) as HTMLButtonElement;
const inputArchivoOpensearch = document.getElementById(
  "archivo-opensearch"
) as HTMLInputElement;
const estadoOpensearch = document.getElementById(
  "estado-opensearch"
) as HTMLDivElement;
const contenedorFiltrosOpensearch = document.getElementById(
  "filtros-opensearch"
) as HTMLDivElement;
const selectorUrlService = document.getElementById(
  "filtro-url-service"
) as HTMLSelectElement;
const selectorDataMessage = document.getElementById(
  "filtro-data-message"
) as HTMLSelectElement;
const contenedorResumenOpensearch = document.getElementById(
  "resumen-opensearch"
) as HTMLDivElement;
const textoTotalAlumnos = document.getElementById(
  "total-alumnos-afectados"
) as HTMLSpanElement;
const botonDescargarAlumnos = document.getElementById(
  "boton-descargar-alumnos"
) as HTMLButtonElement;
const botonDescargarFiltrado = document.getElementById(
  "boton-descargar-filtrado"
) as HTMLButtonElement;
const botonVerTablaFiltrada = document.getElementById(
  "boton-ver-tabla-filtrada"
) as HTMLButtonElement;
const botonCopiarGraficoErrores = document.getElementById(
  "boton-copiar-grafico-errores"
) as HTMLButtonElement;
const contenedorGraficoOpensearch = document.getElementById(
  "contenedor-grafico-opensearch"
) as HTMLDivElement;
const lienzoGraficoErrores = document.getElementById(
  "grafico-errores-hora"
) as HTMLCanvasElement;
const tituloGraficoErrores = document.getElementById(
  "titulo-grafico-errores"
) as HTMLHeadingElement;
const seccionDetalleLogs = document.getElementById(
  "seccion-detalle-logs"
) as HTMLElement;
const inputDetalleIdTransaccion = document.getElementById(
  "detalle-id-transaccion"
) as HTMLInputElement;
const inputDetalleIdSession = document.getElementById(
  "detalle-id-session"
) as HTMLInputElement;
const botonGenerarDetalle = document.getElementById(
  "boton-generar-detalle"
) as HTMLButtonElement;
const botonCopiarQueryDetalle = document.getElementById(
  "boton-copiar-query-detalle"
) as HTMLButtonElement;
const botonDetallePegarJson = document.getElementById(
  "boton-detalle-pegar-json"
) as HTMLButtonElement;
const botonDetalleSubirJson = document.getElementById(
  "boton-detalle-subir-json"
) as HTMLButtonElement;
const inputArchivoDetalleOpensearch = document.getElementById(
  "archivo-detalle-opensearch"
) as HTMLInputElement;
const estadoDetalleUI = document.getElementById(
  "estado-detalle-logs"
) as HTMLDivElement;
const badgeDetalleOpensearch = document.getElementById(
  "detalle-opensearch-total"
) as HTMLSpanElement;
const avisoDetalleOpensearch = document.getElementById(
  "detalle-opensearch-aviso"
) as HTMLParagraphElement;
const badgeDetalleAcciones = document.getElementById(
  "detalle-acciones-total"
) as HTMLSpanElement;
const badgeDetalleEventos = document.getElementById(
  "detalle-eventos-total"
) as HTMLSpanElement;
const cuerpoDetalleOpensearch = document.getElementById(
  "detalle-opensearch-cuerpo"
) as HTMLTableSectionElement;
const cuerpoDetalleAcciones = document.getElementById(
  "detalle-acciones-cuerpo"
) as HTMLTableSectionElement;
const cuerpoDetalleEventos = document.getElementById(
  "detalle-eventos-cuerpo"
) as HTMLTableSectionElement;

const TEXTO_BASE_TITULO_DURACION = "Duración promedio por minuto";
const TEXTO_BASE_TITULO_CONTEO = "Cantidad de transacciones por minuto";

const modalDetalleOpensearch = document.getElementById(
  "modal-detalle-opensearch"
) as HTMLDivElement;
const modalDetalleCuerpo = document.getElementById(
  "modal-detalle-cuerpo"
) as HTMLDivElement;
const botonModalCerrar = document.getElementById(
  "modal-detalle-cerrar"
) as HTMLButtonElement;
const modalTablaFiltrada = document.getElementById(
  "modal-tabla-filtrada"
) as HTMLDivElement;
const modalTablaCerrar = document.getElementById(
  "modal-tabla-cerrar"
) as HTMLButtonElement;
const tablaFiltradaCuerpo = document.getElementById(
  "modal-tabla-cuerpo"
) as HTMLTableSectionElement;
const tablaFiltradaIndicador = document.getElementById(
  "modal-tabla-indicador"
) as HTMLSpanElement;
const tablaFiltradaResumen = document.getElementById(
  "modal-tabla-resumen"
) as HTMLParagraphElement;
const tablaFiltradaPrev = document.getElementById(
  "modal-tabla-prev"
) as HTMLButtonElement;
const tablaFiltradaNext = document.getElementById(
  "modal-tabla-next"
) as HTMLButtonElement;
const overlayModalTabla = modalTablaFiltrada.querySelector(
  ".modal__overlay"
) as HTMLDivElement | null;
const modalDetallePunto = document.getElementById(
  "modal-detalle-punto"
) as HTMLDivElement;
const modalDetallePuntoCerrar = document.getElementById(
  "modal-detalle-punto-cerrar"
) as HTMLButtonElement;
const modalDetallePuntoTitulo = document.getElementById(
  "modal-detalle-punto-titulo"
) as HTMLHeadingElement;
const modalDetallePuntoCuerpo = document.getElementById(
  "modal-detalle-punto-cuerpo"
) as HTMLTableSectionElement;
const overlayModalDetallePunto = modalDetallePunto.querySelector(
  ".modal__overlay"
) as HTMLDivElement | null;

type Grafico = InstanceType<ChartConstructor>;

const graficosPorAccion = new Map<
  string,
  {
    duracion?: Grafico;
    conteo?: Grafico;
  }
>();
let graficoErroresPorHora: Grafico | undefined;
interface VistaGraficosAccion {
  contenedor: HTMLDivElement;
  canvasDuracion: HTMLCanvasElement;
  canvasConteo: HTMLCanvasElement;
  tituloDuracion: HTMLHeadingElement;
  tituloConteo: HTMLHeadingElement;
}
const vistasGraficosPorAccion = new Map<string, VistaGraficosAccion>();
let sortableAcciones: SortableInstance | null = null;
let ordenAccionesCopia: string[] = [];

const appLayout = document.querySelector(".app-layout") as HTMLDivElement;
const botonToggleMenu = document.getElementById(
  "boton-toggle-menu"
) as HTMLButtonElement;
const textoToggleMenu = botonToggleMenu.querySelector(
  ".control-menu__texto"
) as HTMLSpanElement;
const CLASE_MENU_COLAPSADO = "menu-colapsado";

const ESTILO = getComputedStyle(document.documentElement);
const COLOR_FONDO =
  ESTILO.getPropertyValue("--color-fondo").trim() || "#f5f5f5";
const COLOR_PANEL =
  ESTILO.getPropertyValue("--color-panel").trim() || "#ffffff";
const COLOR_BORDE =
  ESTILO.getPropertyValue("--borde-suave").trim() || "#e5e7eb";
const COLOR_AZUL = ESTILO.getPropertyValue("--color-azul").trim() || "#1f6feb";
const COLOR_ACENTO =
  ESTILO.getPropertyValue("--color-acento").trim() || "#0d9488";
const REGISTROS_TABLA_POR_PAGINA = 20;
let paginaTablaFiltrada = 1;

const CONFIG_BD_POR_DEFECTO: ConfiguracionBaseDeDatos = {
  host: "localhost",
  port: "5432",
  user: "postgres",
  password: "",
  database: "monitoreo",
};

const itemsMenuSeccion = document.querySelectorAll(
  "[data-section]"
) as NodeListOf<HTMLLIElement>;
const gruposMenu = document.querySelectorAll(
  ".menu-principal__grupo"
) as NodeListOf<HTMLLIElement>;
const seccionDashboard = document.getElementById(
  "seccion-dashboard"
) as HTMLElement;
const seccionDashboardTiempos = document.getElementById(
  "seccion-dashboard-tiempos"
) as HTMLElement;
const seccionConfiguracion = document.getElementById(
  "seccion-configuracion"
) as HTMLElement;
const modalCopiarGraficos = document.getElementById(
  "modal-copiar-graficos"
) as HTMLDivElement;
const modalCopiarCerrar = document.getElementById(
  "modal-copiar-cerrar"
) as HTMLButtonElement;
const modalCopiarCancelar = document.getElementById(
  "modal-copiar-cancelar"
) as HTMLButtonElement;
const modalCopiarConfirmar = document.getElementById(
  "modal-copiar-confirmar"
) as HTMLButtonElement;
const listaAccionesCopia = document.getElementById(
  "lista-acciones-copia"
) as HTMLDivElement;
const contenedoresGraficosPorAccion = new Map<string, HTMLDivElement>();
const modalCopiarOverlay = modalCopiarGraficos.querySelector(
  ".modal__overlay"
) as HTMLDivElement | null;
modalCopiarConfirmar.disabled = true;
const itemMenuTiempos = document.querySelector(
  '[data-section="dashboard-tiempos"]'
) as HTMLLIElement | null;
const grupoDashboard = document.querySelector(
  '[data-grupo="dashboard"]'
) as HTMLLIElement | null;

const formularioConfiguracion = document.getElementById(
  "formulario-configuracion"
) as HTMLFormElement;
const inputConfigHost = document.getElementById(
  "config-host"
) as HTMLInputElement;
const inputConfigPort = document.getElementById(
  "config-port"
) as HTMLInputElement;
const inputConfigUser = document.getElementById(
  "config-user"
) as HTMLInputElement;
const inputConfigPassword = document.getElementById(
  "config-password"
) as HTMLInputElement;
const inputConfigDatabase = document.getElementById(
  "config-database"
) as HTMLInputElement;
const botonGuardarConfiguracion = document.getElementById(
  "boton-guardar-configuracion"
) as HTMLButtonElement;
const botonRecargarConfiguracion = document.getElementById(
  "boton-recargar-configuracion"
) as HTMLButtonElement;
const estadoConfiguracion = document.getElementById(
  "estado-configuracion"
) as HTMLDivElement;
const alertaConfiguracion = document.getElementById(
  "alerta-configuracion"
) as HTMLDivElement;

const estadoDashboard: EstadoDashboard = {
  registrosCrudos: [],
  registrosFiltrados: [],
  accionesDisponibles: [],
};
let accionesSeleccionadasParaCopiar = new Set<string>();

const estadoOpenSearch: EstadoOpenSearch = {
  registros: [],
  registrosFiltrados: [],
  filtros: {
    urlService: "todos",
    dataMessage: "todos",
  },
};

const estadoDetalleLogs: EstadoDetalleLogs = {
  filtros: {
    idTransaccion: "",
    idSession: "",
  },
  opensearch: [],
  logacciones: [],
  logeventos: [],
};

type SeccionActiva =
  | "dashboard"
  | "dashboard-tiempos"
  | "configuracion"
  | "logs-errores"
  | "detalle-logs";
let seccionActual: SeccionActiva = "dashboard";

type TipoEstadoUI = "info" | "alerta" | "error" | "exito";

/**
 * Ajusta el mensaje de estado visible para el usuario.
 * Muestra feedback claro para los escenarios de carga, error, éxito o falta de datos.
 * Impacta en la percepción de estabilidad y en la confianza del usuario durante la consulta manual.
 */
function mostrarEstadoDeConsulta(
  mensaje: string,
  tipo: TipoEstadoUI = "info"
): void {
  contenedorEstado.textContent = mensaje;
  contenedorEstado.className = `estado ${tipo}`;
}

function mostrarEstadoDeOpensearch(
  mensaje: string,
  tipo: TipoEstadoUI = "info"
): void {
  estadoOpensearch.textContent = mensaje;
  estadoOpensearch.className = `estado ${tipo}`;
}

function mostrarEstadoDetalleLogs(
  mensaje: string,
  tipo: TipoEstadoUI = "info"
): void {
  estadoDetalleUI.textContent = mensaje;
  estadoDetalleUI.className = `estado ${tipo}`;
}

/**
 * Habilita o deshabilita los controles de la UI durante operaciones largas.
 * Evita que el usuario dispare múltiples consultas simultáneas o cambie filtros mientras se cargan datos.
 * Impacta en la experiencia de uso al prevenir bloqueos o estados inconsistentes.
 */
function bloquearUIDuranteCarga(
  estaCargando: boolean,
  origen: "consulta" | "csv" = "consulta"
): void {
  botonConsultar.disabled = estaCargando;
  botonCargarCsv.disabled = estaCargando;
  inputFechaInicio.disabled = estaCargando;
  inputFechaFin.disabled = estaCargando;
  botonConsultar.textContent = estaCargando ? "Consultando..." : "Consultar";
  botonCargarCsv.textContent = estaCargando
    ? "Cargando CSV..."
    : "Consultar por CSV";
}

function actualizarDisponibilidadDeTiempos(disponible: boolean): void {
  if (!itemMenuTiempos) {
    return;
  }

  itemMenuTiempos.classList.toggle(
    "menu-secundario__item--deshabilitado",
    !disponible
  );
  itemMenuTiempos.setAttribute("aria-disabled", String(!disponible));

  if (!disponible && seccionActual === "dashboard-tiempos") {
    cambiarSeccion("dashboard");
  }
}

/**
 * Muestra el estado de la sección de configuración y reutiliza el estilo global de alertas.
 */
function mostrarEstadoDeConfiguracion(
  mensaje: string,
  tipo: TipoEstadoUI = "info"
): void {
  estadoConfiguracion.textContent = mensaje;
  estadoConfiguracion.className = `estado ${tipo}`;
}

function mostrarAlertaDeConfiguracion(mensaje: string): void {
  alertaConfiguracion.textContent = mensaje;
  alertaConfiguracion.hidden = false;
}

function limpiarAlertaDeConfiguracion(): void {
  alertaConfiguracion.hidden = true;
  alertaConfiguracion.textContent = "";
}

function bloquearFormularioDeConfiguracion(estaProcesando: boolean): void {
  inputConfigHost.disabled = estaProcesando;
  inputConfigPort.disabled = estaProcesando;
  inputConfigUser.disabled = estaProcesando;
  inputConfigPassword.disabled = estaProcesando;
  inputConfigDatabase.disabled = estaProcesando;
  botonGuardarConfiguracion.disabled = estaProcesando;
  botonRecargarConfiguracion.disabled = estaProcesando;
  botonGuardarConfiguracion.textContent = estaProcesando
    ? "Guardando..."
    : "Guardar configuración";
}

function rellenarFormularioConfiguracion(
  valores: ConfiguracionBaseDeDatos
): void {
  inputConfigHost.value = valores.host ?? "";
  inputConfigPort.value = valores.port ?? "";
  inputConfigUser.value = valores.user ?? "";
  inputConfigPassword.value = valores.password ?? "";
  inputConfigDatabase.value = valores.database ?? "";
}

function obtenerConfiguracionDesdeFormulario(): ConfiguracionBaseDeDatos {
  return {
    host: inputConfigHost.value.trim(),
    port: inputConfigPort.value.trim(),
    user: inputConfigUser.value.trim(),
    password: inputConfigPassword.value.trim(),
    database: inputConfigDatabase.value.trim(),
  };
}

function validarConfiguracion(valores: ConfiguracionBaseDeDatos): string[] {
  const errores: string[] = [];
  if (!valores.host) {
    errores.push("Indica un host de base de datos.");
  }

  const numeroDePuerto = Number(valores.port);
  if (Number.isNaN(numeroDePuerto) || numeroDePuerto <= 0) {
    errores.push("El puerto debe ser un número mayor a cero.");
  }

  if (!valores.user) {
    errores.push("Indica el usuario de conexión.");
  }

  if (!valores.database) {
    errores.push("Indica la base de datos a usar.");
  }

  return errores;
}

async function cargarConfiguracionDeEnv(): Promise<void> {
  bloquearFormularioDeConfiguracion(true);
  limpiarAlertaDeConfiguracion();
  mostrarEstadoDeConfiguracion("Cargando configuración...", "info");

  try {
    const respuesta = await window.electronAPI.obtenerConfiguracionDeEnv();
    const valores = respuesta.configuracion ?? CONFIG_BD_POR_DEFECTO;
    rellenarFormularioConfiguracion(valores);

    if (!respuesta.existeArchivoEnv) {
      mostrarAlertaDeConfiguracion(
        "No se encontró el archivo .env. Se usará configuración en memoria; los cambios no se guardan en disco."
      );
      mostrarEstadoDeConfiguracion(
        "Sin archivo base: puedes ingresar los valores manualmente.",
        "alerta"
      );
    } else {
      mostrarEstadoDeConfiguracion(
        "Configuración cargada desde .env.",
        "exito"
      );
    }
  } catch (error) {
    const mensaje =
      error instanceof Error
        ? error.message
        : "No se pudo leer la configuración.";
    mostrarEstadoDeConfiguracion(`Error al leer .env: ${mensaje}`, "error");
  } finally {
    bloquearFormularioDeConfiguracion(false);
  }
}

async function manejarGuardadoDeConfiguracion(
  evento: SubmitEvent
): Promise<void> {
  evento.preventDefault();
  const valores = obtenerConfiguracionDesdeFormulario();
  const errores = validarConfiguracion(valores);
  if (errores.length > 0) {
    mostrarEstadoDeConfiguracion(errores.join(" "), "alerta");
    return;
  }

  bloquearFormularioDeConfiguracion(true);
  mostrarEstadoDeConfiguracion("Guardando configuración...", "info");

  try {
    const respuesta = await window.electronAPI.guardarConfiguracionDeEnv(
      valores
    );
    rellenarFormularioConfiguracion(respuesta.configuracion);
    limpiarAlertaDeConfiguracion();
    mostrarEstadoDeConfiguracion(
      "Configuración actualizada en memoria para esta sesión.",
      "exito"
    );
  } catch (error) {
    const mensaje =
      error instanceof Error
        ? error.message
        : "No se pudo guardar la configuración.";
    mostrarEstadoDeConfiguracion(`Error al guardar: ${mensaje}`, "error");
  } finally {
    bloquearFormularioDeConfiguracion(false);
  }
}

function cambiarSeccion(seccion: SeccionActiva): void {
  seccionActual = seccion;
  itemsMenuSeccion.forEach((item) => {
    const destino = item.dataset.section;
    item.classList.toggle("activo", destino === seccion);
  });

  const itemSubmenuErrores = document.querySelector(
    '.menu-secundario__item[data-section="logs-errores"]'
  ) as HTMLLIElement | null;
  const grupoOpensearch = itemSubmenuErrores?.closest(
    ".menu-principal__grupo"
  ) as HTMLLIElement | null;
  if (seccion === "logs-errores") {
    grupoOpensearch?.classList.add("abierto", "activo");
  } else {
    grupoOpensearch?.classList.remove("activo");
  }

  const seccionDashboardActiva =
    seccion === "dashboard" || seccion === "dashboard-tiempos";
  if (seccionDashboardActiva) {
    grupoDashboard?.classList.add("abierto", "activo");
  } else {
    grupoDashboard?.classList.remove("activo");
  }

  seccionDashboard.hidden = seccion !== "dashboard";
  seccionDashboardTiempos.hidden = seccion !== "dashboard-tiempos";
  seccionConfiguracion.hidden = seccion !== "configuracion";
  seccionLogsErrores.hidden = seccion !== "logs-errores";
  seccionDetalleLogs.hidden = seccion !== "detalle-logs";
}

/**
 * Convierte un registro crudo en un objeto con tipos apropiados para cálculo.
 * Normaliza la fecha a un objeto Date y asegura que el tiempo esté en número.
 * Impacta en la transformacion de datos previa a los cálculos de métricas.
 */
function normalizarRegistroCrudo(
  registroCrudo: RegistroCrudo
): RegistroNormalizado {
  return {
    fechaEvento: new Date(registroCrudo.fecha),
    accion: registroCrudo.accion,
    tiempo: Number(registroCrudo.tiempo),
    idTransaccion: String(registroCrudo.id_transaccion ?? ""),
    idSesion: String(registroCrudo.id_sesion ?? ""),
    status: String(registroCrudo.status ?? ""),
    fechaCruda: registroCrudo.fecha,
  };
}

/**
 * Actualiza el estado interno y la UI a partir de registros crudos ya obtenidos.
 * Se reutiliza tanto para consultas a base de datos como para archivos CSV.
 * Impacta en la consistencia de la app al centralizar la lógica de carga de datos.
 */
function cargarRegistrosEnDashboard(
  registrosCrudos: RegistroCrudo[],
  mensajeExito: string,
  mensajeSinDatos: string
): void {
  const registrosNormalizados = registrosCrudos
    .map(normalizarRegistroCrudo)
    .filter(
      (registro) =>
        !Number.isNaN(registro.fechaEvento.getTime()) &&
        !Number.isNaN(registro.tiempo) &&
        !registro.accion.includes("Seleccion") &&
        !registro.accion.includes("Deselección") &&
        !registro.accion.includes("Selección")
    );

  if (registrosNormalizados.length === 0) {
    mostrarEstadoDeConsulta(mensajeSinDatos, "alerta");
    limpiarGraficosDeAcciones();
    actualizarListaAccionesParaCopiar([]);
    actualizarDisponibilidadDeTiempos(false);
    return;
  }

  estadoDashboard.registrosCrudos = registrosNormalizados;
  estadoDashboard.registrosCrudos.sort(
    (a, b) => a.fechaEvento.getTime() - b.fechaEvento.getTime()
  );
  estadoDashboard.registrosFiltrados = registrosNormalizados;
  const accionesUnicas = Array.from(
    new Set<string>(registrosNormalizados.map((registro) => registro.accion))
  ).sort();
  estadoDashboard.accionesDisponibles = accionesUnicas;
  renderizarTodosLosGraficosPorAccion();
  actualizarDisponibilidadDeTiempos(true);
  mostrarEstadoDeConsulta(mensajeExito, "exito");
}

/**
 * Construye las opciones del filtro secundario a partir de las acciones únicas en la data cargada.
 * No dispara consultas nuevas; simplemente actualiza el selector disponible en la UI.
 * Impacta en la navegabilidad y en el recalculo de gráficos sin tocar la base de datos.
 */
function crearVistaGraficosParaAccion(
  accion: string
): VistaGraficosAccion {
  const contenedor = document.createElement("div");
  contenedor.className = "grupo-graficos-accion";
  contenedor.dataset.accion = accion;

  const layout = document.createElement("div");
  layout.className = "graficos";

  const tarjetaDuracion = document.createElement("div");
  tarjetaDuracion.className = "grafico";
  const headerDuracion = document.createElement("header");
  const tituloDuracion = document.createElement("h3");
  tituloDuracion.textContent = `${TEXTO_BASE_TITULO_DURACION} - ${accion}`;
  headerDuracion.appendChild(tituloDuracion);
  tarjetaDuracion.appendChild(headerDuracion);
  const canvasDuracion = document.createElement("canvas");
  tarjetaDuracion.appendChild(canvasDuracion);

  const tarjetaConteo = document.createElement("div");
  tarjetaConteo.className = "grafico";
  const headerConteo = document.createElement("header");
  const tituloConteo = document.createElement("h3");
  tituloConteo.textContent = `${TEXTO_BASE_TITULO_CONTEO} - ${accion}`;
  headerConteo.appendChild(tituloConteo);
  tarjetaConteo.appendChild(headerConteo);
  const canvasConteo = document.createElement("canvas");
  tarjetaConteo.appendChild(canvasConteo);

  layout.appendChild(tarjetaDuracion);
  layout.appendChild(tarjetaConteo);
  contenedor.appendChild(layout);

  return {
    contenedor,
    canvasDuracion,
    canvasConteo,
    tituloDuracion,
    tituloConteo,
  };
}

/**
 * Convierte el campo tiempo a segundos asumiendo que llega en milisegundos.
 * Si el valor ya está en segundos, el impacto es mínimo y se prioriza la legibilidad.
 * Impacta directamente en el gráfico de duración promedio por minuto.
 */
function convertirTiempoASegundos(valorTiempo: number | string): number {
  const tiempoNumerico = Number(valorTiempo);
  if (Number.isNaN(tiempoNumerico)) {
    return 0;
  }

  return tiempoNumerico / 1000;
}

/**
 * Detecta el delimitador del CSV de forma básica.
 * Permite archivos separados por coma o punto y coma sin configurar opciones adicionales.
 */
function obtenerDelimitador(lineaCabecera: string): "," | ";" {
  if (lineaCabecera.includes(";") && !lineaCabecera.includes(",")) {
    return ";";
  }

  return ",";
}

/**
 * Lee un archivo como texto usando FileReader y lo retorna como promesa.
 */
function leerArchivoComoTexto(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => {
      resolve(typeof lector.result === "string" ? lector.result : "");
    };
    lector.onerror = () => {
      reject(
        lector.error || new Error("No se pudo leer el archivo seleccionado.")
      );
    };
    lector.readAsText(archivo);
  });
}

function convertirFechaLocalAIso(valorFecha: string): string | null {
  if (!valorFecha) {
    return null;
  }

  const fecha = new Date(valorFecha);
  if (Number.isNaN(fecha.getTime())) {
    return null;
  }

  return fecha.toISOString();
}

function construirQueryOpensearch(
  fechaInicioLocal: string,
  fechaFinLocal: string
): string | null {
  const fechaInicioIso = convertirFechaLocalAIso(fechaInicioLocal);
  const fechaFinIso = convertirFechaLocalAIso(fechaFinLocal);

  if (!fechaInicioIso || !fechaFinIso) {
    return null;
  }

  return `GET log-matriculaautoescalable-ms-academica-*/_search
{
  "size": 10000,
  "_source": [
    "@timestamp",
    "idTransaccion",
    "idSession",
    "status",
    "action",
    "message",
    "data.message",
    "code_student",
    "code_emplid",
    "urlService",
    "log"
  ],
  "query": {
    "bool": {
      "must": [
        {
          "range": {
            "@timestamp": {
              "gte": "${fechaInicioIso}",
              "lte": "${fechaFinIso}"
            }
          }
        },
        {
          "match": {
            "status": "ERROR"
          }
        },
        {
          "exists": {
            "field": "action"
          }
        }
      ],
      "must_not": [
        {
          "match": {
            "message": "healthcheck"
          }
        },
        {
          "match_phrase": {
            "action": "Error logic in controller"
          }
        }
      ]
    }
  },
  "sort": [
    { "@timestamp": { "order": "desc" } }
  ]
}`;
}

async function copiarQueryDeOpensearch(): Promise<void> {
  const query = construirQueryOpensearch(
    inputFechaInicioOpensearch.value,
    inputFechaFinOpensearch.value
  );

  if (!query) {
    mostrarEstadoDeOpensearch(
      "Indica fecha inicio y fecha fin para construir la query.",
      "alerta"
    );
    return;
  }

  try {
    botonCopiarQueryOpensearch.disabled = true;
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(query);
      mostrarEstadoDeOpensearch("Query copiada al portapapeles.", "exito");
      return;
    }

    const area = document.createElement("textarea");
    area.value = query;
    area.setAttribute("readonly", "true");
    area.style.position = "absolute";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    document.body.removeChild(area);
    mostrarEstadoDeOpensearch("Query copiada al portapapeles.", "exito");
  } catch (error) {
    console.error("No se pudo copiar la query:", error);
    mostrarEstadoDeOpensearch(
      "No se pudo copiar la query. Copia manualmente el texto generado.",
      "error"
    );
  } finally {
    botonCopiarQueryOpensearch.disabled = false;
  }
}

function extraerHitsDeRespuesta(json: unknown): unknown[] {
  if (!json) {
    return [];
  }

  if (Array.isArray(json)) {
    return json;
  }

  if (Array.isArray((json as { hits?: unknown }).hits)) {
    return (json as { hits?: unknown[] }).hits ?? [];
  }

  const hitsAnidados = (json as { hits?: { hits?: unknown[] } }).hits?.hits;
  if (Array.isArray(hitsAnidados)) {
    return hitsAnidados;
  }

  return [];
}

function normalizarHitDeOpensearch(
  hit: unknown
): LogOpensearchNormalizado | null {
  const conFuente =
    (hit as { _source?: unknown })._source ??
    (hit as { source?: unknown }).source ??
    hit;

  if (!conFuente || typeof conFuente !== "object") {
    return null;
  }

  const fuente = conFuente as Record<string, unknown>;
  const fechaIso =
    (fuente["@timestamp"] as string | undefined) ||
    (fuente.timestamp as string | undefined);

  if (!fechaIso) {
    return null;
  }

  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) {
    return null;
  }

  const data = (fuente.data as { message?: unknown }) || {};

  return {
    fechaEvento: fecha,
    urlService: String(fuente.urlService ?? ""),
    dataMessage: String(data.message ?? ""),
    codeStudent: String(fuente.code_student ?? fuente.codeStudent ?? ""),
    codeEmplid: String(fuente.code_emplid ?? fuente.codeEmplid ?? ""),
    action: String(fuente.action ?? ""),
    status: String(fuente.status ?? ""),
    idTransaccion: String(fuente.idTransaccion ?? ""),
    idSession: String(fuente.idSession ?? ""),
    message: String(fuente.message ?? ""),
    log: String(fuente.log ?? ""),
  };
}

function parsearRespuestaDeOpensearch(contenido: string): LogOpensearchNormalizado[] {
  const json = parsearContenidoJsonLaxo(contenido);

  const hits = extraerHitsDeRespuesta(json);
  if (!hits || hits.length === 0) {
    return [];
  }

  return hits
    .map(normalizarHitDeOpensearch)
    .filter((registro): registro is LogOpensearchNormalizado => registro !== null);
}

function renderizarGraficoErroresPorHora(
  etiquetasHoras: string[],
  seriesPorDia: { dia: string; conteosPorHora: (number | null)[] }[],
  maximoConteo: number
): void {
  if (graficoErroresPorHora) {
    graficoErroresPorHora.destroy();
  }

  const datasets = seriesPorDia.map((serie, indice) => {
    const color = obtenerColorDeSerie(indice + 2);
    return {
      label: serie.dia,
      data: serie.conteosPorHora,
      borderColor: color,
      backgroundColor: colorConOpacidad(color, 0.2),
      tension: 0,
      spanGaps: false,
      pointRadius: 2,
      fill: false,
    };
  });

  const limiteSuperior = Math.max(1, Math.ceil(maximoConteo) + 1);

  graficoErroresPorHora = new Chart(lienzoGraficoErrores, {
    type: "line",
    data: {
      labels: etiquetasHoras,
      datasets,
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      scales: {
        x: {
          ticks: { color: "#374151", maxRotation: 0, autoSkip: true },
          grid: { color: "#e5e7eb" },
        },
        y: {
          beginAtZero: true,
          max: limiteSuperior,
          ticks: { color: "#374151", stepSize: 1 },
          grid: { color: "#e5e7eb" },
        },
      },
      plugins: {
        legend: { display: true, labels: { color: "#111827", boxWidth: 16 } },
        title: {
          display: true,
          text: tituloGraficoErrores?.textContent ?? "Errores por hora",
          color: "#111827",
          font: { weight: "bold", size: 16 },
          padding: { bottom: 12 },
        },
      },
    },
  });
}

function calcularSeriesErroresPorDia(
  registros: LogOpensearchNormalizado[]
): {
  etiquetasHoras: string[];
  seriesPorDia: { dia: string; conteosPorHora: (number | null)[] }[];
  maximoConteo: number;
} {
  const horasEncontradas = new Set<string>();
  const mapaPorDia = new Map<string, Map<string, number>>();

  registros.forEach((registro) => {
    const marcaHora = new Date(registro.fechaEvento);
    marcaHora.setSeconds(0, 0);
    const claveHora = formatearHoraParaEtiqueta(marcaHora);
    const claveDia = obtenerIdDia(marcaHora);
    horasEncontradas.add(claveHora);

    const mapaHoras = mapaPorDia.get(claveDia) ?? new Map<string, number>();
    const conteoActual = mapaHoras.get(claveHora) ?? 0;
    mapaHoras.set(claveHora, conteoActual + 1);
    mapaPorDia.set(claveDia, mapaHoras);
  });

  const etiquetasHoras = Array.from(horasEncontradas).sort();
  const seriesPorDia = Array.from(mapaPorDia.entries())
    .sort(([diaA], [diaB]) => diaA.localeCompare(diaB))
    .map(([dia, mapaHoras]) => {
      const conteosPorHora: (number | null)[] = [];
      etiquetasHoras.forEach((hora) => {
        const valor = mapaHoras.get(hora);
        conteosPorHora.push(valor ?? null);
      });
      return { dia, conteosPorHora };
    });

  const valores = seriesPorDia.flatMap((serie) =>
    serie.conteosPorHora.filter(
      (valor): valor is number => valor !== null && !Number.isNaN(valor)
    )
  );
  const maximoConteo = valores.length > 0 ? Math.max(...valores) : 0;

  return { etiquetasHoras, seriesPorDia, maximoConteo };
}

function obtenerMensajesPorUrl(urlService: string): string[] {
  return Array.from(
    new Set(
      estadoOpenSearch.registros
        .filter(
          (registro) => urlService === "todos" || registro.urlService === urlService
        )
        .map((registro) => registro.dataMessage || registro.message)
        .filter((valor) => valor && valor.trim().length > 0)
    )
  ).sort();
}

function actualizarMensajesDisponibles(urlSeleccionada: string): void {
  const mensajes = obtenerMensajesPorUrl(urlSeleccionada);
  const seleccionPrev = selectorDataMessage.value;

  selectorDataMessage.innerHTML = "";
  const opcionTodosMensaje = document.createElement("option");
  opcionTodosMensaje.value = "todos";
  opcionTodosMensaje.textContent = "Todos los mensajes";
  selectorDataMessage.appendChild(opcionTodosMensaje);

  mensajes.forEach((mensaje) => {
    const opcion = document.createElement("option");
    opcion.value = mensaje;
    opcion.textContent = mensaje;
    selectorDataMessage.appendChild(opcion);
  });

  selectorDataMessage.value = mensajes.includes(seleccionPrev)
    ? seleccionPrev
    : "todos";
}

function poblarFiltrosDeOpensearch(): void {
  const urls = Array.from(
    new Set(
      estadoOpenSearch.registros
        .map((registro) => registro.urlService)
        .filter((valor) => valor && valor.trim().length > 0)
    )
  ).sort();
  const mensajesTotales = obtenerMensajesPorUrl("todos");

  selectorUrlService.innerHTML = "";
  selectorDataMessage.innerHTML = "";

  const opcionTodosUrl = document.createElement("option");
  opcionTodosUrl.value = "todos";
  opcionTodosUrl.textContent = "Todos los servicios";
  selectorUrlService.appendChild(opcionTodosUrl);

  urls.forEach((url) => {
    const opcion = document.createElement("option");
    opcion.value = url;
    opcion.textContent = url;
    selectorUrlService.appendChild(opcion);
  });

  selectorUrlService.value = "todos";
  selectorDataMessage.value = "todos";
  actualizarMensajesDisponibles("todos");
  contenedorFiltrosOpensearch.hidden =
    urls.length === 0 && mensajesTotales.length === 0;
}

function actualizarResumenDeAlumnos(
  registros: LogOpensearchNormalizado[]
): void {
  const mapaAlumnos = new Map<string, string>();
  registros.forEach((registro) => {
    const claveAlumno = registro.codeEmplid || registro.codeStudent;
    if (!claveAlumno) {
      return;
    }
    if (!mapaAlumnos.has(claveAlumno)) {
      mapaAlumnos.set(claveAlumno, registro.codeStudent || registro.codeEmplid);
    }
  });

  const total = mapaAlumnos.size;
  textoTotalAlumnos.textContent = total.toString();
  contenedorResumenOpensearch.hidden = registros.length === 0;
}

function aplicarFiltrosDeOpensearch(): void {
  const urlSeleccionada = selectorUrlService.value;
  const mensajeSeleccionado = selectorDataMessage.value;

  estadoOpenSearch.filtros = {
    urlService: urlSeleccionada,
    dataMessage: mensajeSeleccionado,
  };

  estadoOpenSearch.registrosFiltrados = estadoOpenSearch.registros.filter(
    (registro) => {
      const coincideUrl =
        urlSeleccionada === "todos" || registro.urlService === urlSeleccionada;
      const mensajeBase = registro.dataMessage || registro.message;
      const coincideMensaje =
        mensajeSeleccionado === "todos" || mensajeBase === mensajeSeleccionado;

      return coincideUrl && coincideMensaje;
    }
  );

  const textoUrl =
    selectorUrlService.options[selectorUrlService.selectedIndex]?.textContent ||
    "Todos los servicios";
  const textoMensaje =
    selectorDataMessage.options[selectorDataMessage.selectedIndex]
      ?.textContent || "Todos los mensajes";
  if (tituloGraficoErrores) {
    tituloGraficoErrores.textContent = `Errores por hora - ${textoUrl} / ${textoMensaje}`;
  }

  if (estadoOpenSearch.registrosFiltrados.length === 0) {
    contenedorGraficoOpensearch.hidden = true;
    contenedorResumenOpensearch.hidden = true;
    graficoErroresPorHora?.destroy();
    if (!modalTablaFiltrada.hidden) {
      renderizarTablaFiltrada();
    }
    mostrarEstadoDeOpensearch(
      "No hay datos para los filtros seleccionados.",
      "alerta"
    );
    return;
  }

  const { etiquetasHoras, seriesPorDia, maximoConteo } =
    calcularSeriesErroresPorDia(estadoOpenSearch.registrosFiltrados);
  if (etiquetasHoras.length === 0) {
    contenedorGraficoOpensearch.hidden = true;
    contenedorResumenOpensearch.hidden = true;
    mostrarEstadoDeOpensearch(
      "No hay marcas de tiempo válidas para graficar.",
      "alerta"
    );
    return;
  }
  contenedorGraficoOpensearch.hidden = etiquetasHoras.length === 0;
  actualizarResumenDeAlumnos(estadoOpenSearch.registrosFiltrados);
  renderizarGraficoErroresPorHora(etiquetasHoras, seriesPorDia, maximoConteo);
  if (!modalTablaFiltrada.hidden) {
    paginaTablaFiltrada = 1;
    renderizarTablaFiltrada();
  }
  mostrarEstadoDeOpensearch("Datos listos para análisis.", "exito");
}

async function cargarJsonDeOpensearch(
  contenido: string,
  origen: "portapapeles" | "archivo"
): Promise<void> {
  mostrarEstadoDeOpensearch("Procesando datos...", "info");
  graficoErroresPorHora?.destroy();
  contenedorGraficoOpensearch.hidden = true;
  contenedorResumenOpensearch.hidden = true;

  try {
    const registros = parsearRespuestaDeOpensearch(contenido);
    if (registros.length === 0) {
      mostrarEstadoDeOpensearch(
        "El JSON no tiene hits con datos aprovechables.",
        "alerta"
      );
      estadoOpenSearch.registros = [];
      estadoOpenSearch.registrosFiltrados = [];
      contenedorFiltrosOpensearch.hidden = true;
      cerrarModalTablaFiltrada();
      return;
    }

    estadoOpenSearch.registros = registros;
    estadoOpenSearch.registrosFiltrados = registros;
    poblarFiltrosDeOpensearch();
    contenedorFiltrosOpensearch.hidden = false;
    aplicarFiltrosDeOpensearch();
    mostrarEstadoDeOpensearch(
      `Datos cargados desde ${origen === "archivo" ? "archivo" : "portapapeles"}.`,
      "exito"
    );
  } catch (error) {
    console.error("No se pudo procesar el JSON de opensearch:", error);
    const mensaje =
      error instanceof Error ? error.message : "Error desconocido al leer el JSON.";
    mostrarEstadoDeOpensearch(mensaje, "error");
  }
}

async function manejarPegadoDeJson(): Promise<void> {
  if (!navigator.clipboard?.readText) {
    mostrarEstadoDeOpensearch(
      "Tu entorno no permite leer texto del portapapeles.",
      "alerta"
    );
    return;
  }

  try {
    botonPegarJson.disabled = true;
    const contenido = await navigator.clipboard.readText();
    if (!contenido) {
      mostrarEstadoDeOpensearch(
        "El portapapeles está vacío o no contiene texto.",
        "alerta"
      );
      return;
    }

    await cargarJsonDeOpensearch(contenido, "portapapeles");
  } finally {
    botonPegarJson.disabled = false;
  }
}

async function manejarCargaDeArchivoOpensearch(): Promise<void> {
  const archivo = inputArchivoOpensearch.files?.[0];
  if (!archivo) {
    return;
  }

  try {
    botonSubirJson.disabled = true;
    mostrarEstadoDeOpensearch(`Leyendo ${archivo.name}...`, "info");
    const contenido = await leerArchivoComoTexto(archivo);
    await cargarJsonDeOpensearch(contenido, "archivo");
  } finally {
    botonSubirJson.disabled = false;
    inputArchivoOpensearch.value = "";
  }
}

function descargarAlumnosAfectados(): void {
  if (estadoOpenSearch.registrosFiltrados.length === 0) {
    mostrarEstadoDeOpensearch(
      "No hay datos filtrados para exportar.",
      "alerta"
    );
    return;
  }

  const mapaAlumnos = new Map<string, string>();
  estadoOpenSearch.registrosFiltrados.forEach((registro) => {
    const claveAlumno = registro.codeEmplid || registro.codeStudent;
    if (!claveAlumno) {
      return;
    }
    if (!mapaAlumnos.has(claveAlumno)) {
      mapaAlumnos.set(claveAlumno, registro.codeStudent || registro.codeEmplid);
    }
  });

  if (mapaAlumnos.size === 0) {
    mostrarEstadoDeOpensearch(
      "No hay code_emplid ni code_student presentes para exportar.",
      "alerta"
    );
    return;
  }

  const lineas = ["code_emplid,code_student"];
  mapaAlumnos.forEach((codeStudent, codeEmplid) => {
    lineas.push(`${codeEmplid},"${codeStudent.replace(/"/g, '""')}"`);
  });

  const blob = new Blob([lineas.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "alumnos-afectados.csv";
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
  mostrarEstadoDeOpensearch("Archivo generado.", "exito");
}

function descargarFiltradoCompleto(): void {
  if (estadoOpenSearch.registrosFiltrados.length === 0) {
    mostrarEstadoDeOpensearch(
      "No hay datos filtrados para exportar.",
      "alerta"
    );
    return;
  }

  const encabezados = [
    "@timestamp",
    "urlService",
    "data.message",
    "code_student",
    "code_emplid",
    "action",
    "status",
    "idTransaccion",
    "idSession",
    "message",
    "log",
  ];

  const lineas = [encabezados.join(",")];
  estadoOpenSearch.registrosFiltrados.forEach((registro) => {
    const fila = [
      registro.fechaEvento.toISOString(),
      registro.urlService,
      registro.dataMessage || registro.message,
      registro.codeStudent,
      registro.codeEmplid,
      registro.action,
      registro.status,
      registro.idTransaccion,
      registro.idSession,
      registro.message,
      registro.log,
    ].map((valor) => {
      const texto = valor ?? "";
      const seguro = String(texto).replace(/"/g, '""');
      return `"${seguro}"`;
    });
    lineas.push(fila.join(","));
  });

  const blob = new Blob([lineas.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "opensearch-filtrado.csv";
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
  mostrarEstadoDeOpensearch("Archivo de datos filtrados generado.", "exito");
}

function obtenerTotalPaginasTablaFiltrada(totalRegistros: number): number {
  if (totalRegistros === 0) {
    return 1;
  }
  return Math.ceil(totalRegistros / REGISTROS_TABLA_POR_PAGINA);
}

function construirFilaTablaFiltrada(
  registro: LogOpensearchNormalizado
): HTMLTableRowElement {
  const fila = document.createElement("tr");
  const valores = [
    formatearFechaCorta(registro.fechaEvento),
    registro.urlService,
    registro.dataMessage || registro.message,
    registro.codeStudent || registro.codeEmplid,
    registro.status,
    registro.idTransaccion,
    registro.idSession,
  ];

  valores.forEach((valor) => {
    const celda = document.createElement("td");
    celda.textContent = valor || "—";
    fila.appendChild(celda);
  });

  const celdaAccion = document.createElement("td");
  const botonDetalle = document.createElement("button");
  botonDetalle.type = "button";
  botonDetalle.className = "boton-icono-ghost";
  botonDetalle.title = "Ver detalle completo";
  botonDetalle.setAttribute("aria-label", "Ver detalle completo");
  botonDetalle.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c-4.5 0-8.3 2.9-10 7 1.7 4.1 5.5 7 10 7s8.3-2.9 10-7c-1.7-4.1-5.5-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path></svg>';
  botonDetalle.addEventListener("click", () => {
    irADetalleDesdeTabla(registro);
  });
  celdaAccion.appendChild(botonDetalle);
  fila.appendChild(celdaAccion);

  const celdaStatus = fila.querySelectorAll("td")[4];
  celdaStatus.textContent = "";
  celdaStatus.appendChild(crearBadgeEstadoIcono(registro.status));

  return fila;
}

function renderizarTablaFiltrada(): void {
  const totalRegistros = estadoOpenSearch.registrosFiltrados.length;
  const totalPaginas = obtenerTotalPaginasTablaFiltrada(totalRegistros);

  paginaTablaFiltrada = Math.min(
    Math.max(1, paginaTablaFiltrada),
    totalPaginas
  );

  const inicio = (paginaTablaFiltrada - 1) * REGISTROS_TABLA_POR_PAGINA;
  const fin = inicio + REGISTROS_TABLA_POR_PAGINA;
  const registrosPagina = estadoOpenSearch.registrosFiltrados.slice(
    inicio,
    fin
  );

  tablaFiltradaCuerpo.innerHTML = "";
  if (totalRegistros === 0) {
    tablaFiltradaCuerpo.appendChild(
      crearFilaVacia("No hay datos filtrados para mostrar.", 8)
    );
  } else {
    registrosPagina.forEach((registro) => {
      tablaFiltradaCuerpo.appendChild(construirFilaTablaFiltrada(registro));
    });
  }

  tablaFiltradaResumen.textContent =
    totalRegistros === 1
      ? "1 registro filtrado"
      : `${totalRegistros} registros filtrados`;
  tablaFiltradaIndicador.textContent = `Página ${paginaTablaFiltrada} de ${totalPaginas}`;
  tablaFiltradaPrev.disabled = paginaTablaFiltrada <= 1;
  tablaFiltradaNext.disabled = paginaTablaFiltrada >= totalPaginas;
}

function cerrarModalTablaFiltrada(): void {
  modalTablaFiltrada.hidden = true;
}

function abrirModalTablaFiltrada(): void {
  if (estadoOpenSearch.registrosFiltrados.length === 0) {
    mostrarEstadoDeOpensearch(
      "No hay datos filtrados para mostrar en la tabla.",
      "alerta"
    );
    return;
  }

  paginaTablaFiltrada = 1;
  renderizarTablaFiltrada();
  modalTablaFiltrada.hidden = false;
}

function irADetalleDesdeTabla(registro: LogOpensearchNormalizado): void {
  if (!registro.idTransaccion && !registro.idSession) {
    mostrarEstadoDeOpensearch(
      "El registro no tiene idTransaccion ni idSession para navegar al detalle.",
      "alerta"
    );
    return;
  }

  inputDetalleIdTransaccion.value = registro.idTransaccion;
  inputDetalleIdSession.value = registro.idSession;
  cambiarSeccion("detalle-logs");
  cerrarModalTablaFiltrada();
  actualizarAvisoOpensearchConFiltros(obtenerFiltrosDetalleActual());
  void manejarGenerarDetalle();
}

async function copiarTextoAlPortapapeles(texto: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(texto);
    return;
  }

  const area = document.createElement("textarea");
  area.value = texto;
  area.setAttribute("readonly", "true");
  area.style.position = "absolute";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  document.body.removeChild(area);
}

function obtenerFiltrosDetalleActual(): {
  idTransaccion: string;
  idSession: string;
} {
  return {
    idTransaccion: inputDetalleIdTransaccion.value.trim(),
    idSession: inputDetalleIdSession.value.trim(),
  };
}

function construirQueryDetalleOpensearch(
  idTransaccion: string,
  idSession: string
): string | null {
  const must: string[] = [];

  if (idTransaccion) {
    must.push(`{
        "term":{
            "idTransaccion.keyword":"${idTransaccion}"
        }
      }`);
  }

  if (idSession) {
    must.push(`{
        "term":{
            "idSession.keyword":"${idSession}"
        }
      }`);
  }

  if (must.length === 0) {
    return null;
  }

  const mustComoTexto = must.join(",\n        ");

  return `GET log-matriculaautoescalable-ms-academica-*/_search
{
  "size": 1000,
  "_source": [
    "@timestamp",
    "idTransaccion",
    "idSession",
    "status",
    "action",
    "message",
    "data.message",
    "code_student",
    "code_emplid",
    "urlService",
    "log"
  ],
  "query": {
    "bool": {
      "must": [
        ${mustComoTexto}
      ]
    }
  },
  "sort": [
    { "@timestamp": { "order": "desc" } }
  ]
}`;
}

function crearFilaVacia(
  mensaje: string,
  columnas: number
): HTMLTableRowElement {
  const fila = document.createElement("tr");
  fila.className = "tabla-detalle__vacio";
  const celda = document.createElement("td");
  celda.colSpan = columnas;
  celda.textContent = mensaje;
  fila.appendChild(celda);
  return fila;
}

function crearFilaDetalle(valores: string[]): HTMLTableRowElement {
  const fila = document.createElement("tr");
  valores.forEach((valor) => {
    const celda = document.createElement("td");
    celda.textContent = valor || "—";
    fila.appendChild(celda);
  });
  return fila;
}

function formatearFechaDetallada(fecha: Date): string {
  if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) {
    return "";
  }
  return fecha.toLocaleString("es-PE", {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

function formatearFechaCorta(fecha: Date): string {
  if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) {
    return "";
  }
  return fecha.toLocaleString("es-PE", {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

function esEstadoError(status: string): boolean {
  return status.toLowerCase() === "error";
}

function crearBadgeEstadoIcono(status: string): HTMLSpanElement {
  const esErrorEstado = esEstadoError(status);
  const badge = document.createElement("span");
  badge.className = `badge-estado ${
    esErrorEstado ? "badge-estado--error" : "badge-estado--ok"
  }`;
  badge.setAttribute("role", "img");
  badge.setAttribute("aria-label", esErrorEstado ? "Error" : "OK");
  badge.title = esErrorEstado ? "Error" : "OK";
  badge.innerHTML = esErrorEstado
    ? '<svg class="badge-estado__icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM11 7h2v7h-2V7Zm0 9h2v2h-2v-2Z"/></svg>'
    : '<svg class="badge-estado__icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 13.17-3.59-3.58 1.41-1.42L11 12.34l4.17-4.17 1.41 1.42L11 16.17Z"/></svg>';
  return badge;
}

function formatearJsonLegible(valor: unknown): string {
  if (valor === null || valor === undefined) {
    return "";
  }
  try {
    return JSON.stringify(valor, null, 2);
  } catch (error) {
    console.warn("No se pudo formatear JSON:", error);
    return String(valor);
  }
}

function sanitizarTripleComillas(texto: string): string {
  const patron = /""\"([\s\S]*?)""\"/g; // """ contenido """
  return texto.replace(patron, (_coincidencia, grupo) => {
    try {
      return JSON.stringify(grupo);
    } catch (_error) {
      return `"${grupo.replace(/"/g, '\\"')}"`;
    }
  });
}

function parsearContenidoJsonLaxo(contenido: string): unknown {
  const textoCrudo = contenido.trim();
  const texto = sanitizarTripleComillas(textoCrudo);
  try {
    return JSON.parse(texto);
  } catch (errorJson) {
    console.warn("JSON.parse estándar falló, se intentará un parse laxo:", errorJson);
  }

  // Intento NDJSON (líneas con objetos separados).
  const lineas = texto.split(/\r?\n/).map((linea) => linea.trim()).filter(Boolean);
  if (lineas.length > 1 && lineas.every((linea) => linea.startsWith("{") || linea.startsWith("["))) {
    try {
      const objetos = lineas.map((linea) => JSON.parse(linea));
      return objetos;
    } catch (errorNdjson) {
      console.warn("No se pudo parsear como NDJSON:", errorNdjson);
    }
  }

  // Intento como objeto JS (permite comillas simples o trailing commas).
  try {
    // eslint-disable-next-line no-new-func
    const evaluado = Function(`"use strict"; return (${texto});`)();
    return evaluado;
  } catch (errorEval) {
    console.error("No se pudo interpretar el contenido como JSON:", errorEval);
    throw new Error("El contenido no es un JSON válido.");
  }
}

function normalizarTextoPlano(valor: unknown): string {
  if (valor === null || valor === undefined) {
    return "";
  }
  return String(valor);
}

function normalizarCampoData(valor: unknown): string {
  if (valor === null || valor === undefined) {
    return "";
  }
  if (typeof valor === "string") {
    return valor;
  }
  try {
    return JSON.stringify(valor);
  } catch (error) {
    console.warn("No se pudo serializar campo data:", error);
    return String(valor);
  }
}

function normalizarAccionDesdeBD(
  fila: RegistroDetalleAccionBD
): RegistroDetalleAccionNormalizado {
  const fecha = new Date(fila.fecha);
  return {
    accion: normalizarTextoPlano(fila.accion),
    codAlumno: normalizarTextoPlano(fila.cod_alumno),
    codUser: normalizarTextoPlano(fila.cod_user),
    fecha,
    message: normalizarTextoPlano(fila.message),
    status: normalizarTextoPlano(fila.status),
    tiempo: fila.tiempo ?? "",
    periodo: normalizarTextoPlano(fila.periodo),
    data: normalizarCampoData(fila.data),
  };
}

function normalizarEventoDesdeBD(
  fila: RegistroDetalleEventoBD
): RegistroDetalleEventoNormalizado {
  const fecha = new Date(fila.fecha);
  return {
    urlService: normalizarTextoPlano(fila.url_service),
    status: normalizarTextoPlano(fila.status),
    codeStudent: normalizarTextoPlano(fila.code_student),
    codeEmplid: normalizarTextoPlano(fila.code_emplid),
    action: normalizarTextoPlano(fila.action),
    message: normalizarTextoPlano(fila.message),
    event: normalizarTextoPlano(fila.event),
    duration: fila.duration ?? "",
    data: normalizarCampoData(fila.data),
    code: normalizarTextoPlano(fila.code),
    fecha,
  };
}

function renderizarDetalleOpensearch(
  registros: LogDetalleOpensearch[]
): void {
  cuerpoDetalleOpensearch.innerHTML = "";
  badgeDetalleOpensearch.textContent = registros.length.toString();
  avisoDetalleOpensearch.hidden = true;
  avisoDetalleOpensearch.textContent = "";

  if (registros.length === 0) {
    cuerpoDetalleOpensearch.appendChild(
      crearFilaVacia("Aún no hay datos pegados desde Opensearch.", 6)
    );
    return;
  }

  registros.forEach((registro) => {
    const fila = crearFilaDetalle([
      registro.urlService,
      formatearFechaCorta(registro.fechaEvento),
      registro.codeStudent,
      registro.message,
      registro.status,
      "",
    ]);
    if (esEstadoError(registro.status)) {
      fila.classList.add("error");
    }

    const celdas = fila.querySelectorAll("td");
    const celdaStatus = celdas[4];
    const celdaAccion = celdas[5];
    celdaStatus.textContent = "";
    celdaStatus.appendChild(crearBadgeEstadoIcono(registro.status));

    const botonVer = document.createElement("button");
    botonVer.className = "boton-icono-ghost";
    botonVer.type = "button";
    botonVer.title = "Ver detalle completo";
    botonVer.setAttribute("aria-label", "Ver detalle completo");
    botonVer.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c-4.5 0-8.3 2.9-10 7 1.7 4.1 5.5 7 10 7s8.3-2.9 10-7c-1.7-4.1-5.5-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path></svg>`;
    botonVer.addEventListener("click", () => {
      construirModalDetallado(
        "Detalle de Opensearch",
        [
          { clave: "urlService", valor: registro.urlService },
          { clave: "fecha", valor: formatearFechaDetallada(registro.fechaEvento) },
          { clave: "idTransaccion", valor: registro.idTransaccion },
          { clave: "idSession", valor: registro.idSession },
          { clave: "code_student", valor: registro.codeStudent },
          { clave: "code_emplid", valor: registro.codeEmplid },
          { clave: "action", valor: registro.action },
          { clave: "message", valor: registro.message },
          { clave: "status", valor: registro.status },
        ],
        {
          esError: esEstadoError(registro.status),
          pill: esEstadoError(registro.status) ? "Error" : "OK",
          jsonExtra: { clave: "data", valor: formatearJsonLegible(registro.data) },
        }
      );
    });
    celdaAccion.textContent = "";
    celdaAccion.appendChild(botonVer);

    cuerpoDetalleOpensearch.appendChild(fila);
  });
}

function construirModalDetallado(
  titulo: string,
  pares: Array<{ clave: string; valor: string }>,
  opciones?: { esError?: boolean; pill?: string; jsonExtra?: { clave: string; valor: string } }
): void {
  modalDetalleCuerpo.innerHTML = "";
  const esError = Boolean(opciones?.esError);
  modalDetalleOpensearch.classList.toggle("modal--error", esError);

  const headerTitulo = modalDetalleOpensearch.querySelector(
    ".modal__header-info .modal__titulo"
  ) as HTMLHeadingElement | null;
  const pill = modalDetalleOpensearch.querySelector(
    ".modal__pill"
  ) as HTMLSpanElement | null;
  const iconoEstado = modalDetalleOpensearch.querySelector(
    ".modal__estado-icono"
  ) as HTMLSpanElement | null;
  const esOk = opciones?.pill?.toLowerCase() === "ok";

  if (headerTitulo) {
    headerTitulo.textContent = titulo;
  }

  if (pill) {
    pill.textContent = opciones?.pill ?? "";
    pill.hidden = !opciones?.pill;
  }

  if (iconoEstado) {
    iconoEstado.textContent = esOk ? "OK" : "!";
  }

  pares.forEach((item) => {
    const fila = document.createElement("div");
    fila.className = "modal__fila";
    const clave = document.createElement("div");
    clave.className = "modal__clave";
    clave.textContent = item.clave;
    const valor = document.createElement("div");
    valor.className = "modal__valor";
    valor.textContent = item.valor || "—";
    fila.appendChild(clave);
    fila.appendChild(valor);
    modalDetalleCuerpo.appendChild(fila);
  });

  if (opciones?.jsonExtra) {
    const filaJson = document.createElement("div");
    filaJson.className = "modal__fila";
    const claveJson = document.createElement("div");
    claveJson.className = "modal__clave";
    claveJson.textContent = opciones.jsonExtra.clave;
    const valorJson = document.createElement("pre");
    valorJson.className = "modal__valor modal__valor--json";
    valorJson.textContent = opciones.jsonExtra.valor || "";
    filaJson.appendChild(claveJson);
    filaJson.appendChild(valorJson);
    modalDetalleCuerpo.appendChild(filaJson);
  }

  modalDetalleOpensearch.hidden = false;
}

function cerrarModalDetallado(): void {
  modalDetalleOpensearch.hidden = true;
}

function renderizarDetalleAcciones(
  registros: RegistroDetalleAccionNormalizado[]
): void {
  cuerpoDetalleAcciones.innerHTML = "";
  badgeDetalleAcciones.textContent = registros.length.toString();

  if (registros.length === 0) {
    cuerpoDetalleAcciones.appendChild(
      crearFilaVacia("Sin resultados en mel2.logacciones.", 6)
    );
    return;
  }

  registros.forEach((registro) => {
    const fila = crearFilaDetalle([
      registro.accion,
      registro.codAlumno,
      formatearFechaCorta(registro.fecha),
      registro.message,
      registro.status,
      "",
    ]);
    if (esEstadoError(registro.status)) {
      fila.classList.add("error");
    }

    const celdas = fila.querySelectorAll("td");
    const celdaStatus = celdas[4];
    const celdaAccion = celdas[5];
    celdaStatus.textContent = "";
    celdaStatus.appendChild(crearBadgeEstadoIcono(registro.status));

    const botonVer = document.createElement("button");
    botonVer.className = "boton-icono-ghost";
    botonVer.type = "button";
    botonVer.title = "Ver detalle completo";
    botonVer.setAttribute("aria-label", "Ver detalle completo");
    botonVer.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c-4.5 0-8.3 2.9-10 7 1.7 4.1 5.5 7 10 7s8.3-2.9 10-7c-1.7-4.1-5.5-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path></svg>`;
    botonVer.addEventListener("click", () => {
      construirModalDetallado(
        "Detalle mel2.logacciones",
        [
          { clave: "accion", valor: registro.accion },
          { clave: "cod_alumno", valor: registro.codAlumno },
          { clave: "cod_user", valor: registro.codUser },
          { clave: "fecha", valor: formatearFechaDetallada(registro.fecha) },
          { clave: "message", valor: registro.message },
          { clave: "status", valor: registro.status },
          { clave: "tiempo", valor: normalizarTextoPlano(registro.tiempo) },
          { clave: "periodo", valor: registro.periodo },
        ],
        {
          esError: esEstadoError(registro.status),
          pill: esEstadoError(registro.status) ? "Error" : "OK",
          jsonExtra: { clave: "data", valor: normalizarCampoData(registro.data) },
        }
      );
    });
    celdaAccion.textContent = "";
    celdaAccion.appendChild(botonVer);

    cuerpoDetalleAcciones.appendChild(fila);
  });
}

function renderizarDetalleEventos(
  registros: RegistroDetalleEventoNormalizado[]
): void {
  cuerpoDetalleEventos.innerHTML = "";
  badgeDetalleEventos.textContent = registros.length.toString();

  if (registros.length === 0) {
    cuerpoDetalleEventos.appendChild(
      crearFilaVacia("Sin resultados en mel2.logeventos.", 6)
    );
    return;
  }

  registros.forEach((registro) => {
    const fila = crearFilaDetalle([
      registro.urlService,
      registro.codeStudent,
      registro.message,
      formatearFechaCorta(registro.fecha),
      registro.status,
      "",
    ]);
    if (esEstadoError(registro.status)) {
      fila.classList.add("error");
    }

    const celdas = fila.querySelectorAll("td");
    const celdaStatus = celdas[4];
    const celdaAccion = celdas[5];
    celdaStatus.textContent = "";
    celdaStatus.appendChild(crearBadgeEstadoIcono(registro.status));

    const botonVer = document.createElement("button");
    botonVer.className = "boton-icono-ghost";
    botonVer.type = "button";
    botonVer.title = "Ver detalle completo";
    botonVer.setAttribute("aria-label", "Ver detalle completo");
    botonVer.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c-4.5 0-8.3 2.9-10 7 1.7 4.1 5.5 7 10 7s8.3-2.9 10-7c-1.7-4.1-5.5-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path></svg>`;
    botonVer.addEventListener("click", () => {
      construirModalDetallado(
        "Detalle mel2.logeventos",
        [
          { clave: "url_service", valor: registro.urlService },
          { clave: "status", valor: registro.status },
          { clave: "code_student", valor: registro.codeStudent },
          { clave: "code_emplid", valor: registro.codeEmplid },
          { clave: "action", valor: registro.action },
          { clave: "message", valor: registro.message },
          { clave: "event", valor: registro.event },
          { clave: "duration", valor: normalizarTextoPlano(registro.duration) },
          { clave: "code", valor: registro.code },
          { clave: "fecha", valor: formatearFechaDetallada(registro.fecha) },
        ],
        {
          esError: esEstadoError(registro.status),
          pill: esEstadoError(registro.status) ? "Error" : "OK",
          jsonExtra: {
            clave: "data",
            valor: formatearJsonLegible(registro.data),
          },
        }
      );
    });
    celdaAccion.textContent = "";
    celdaAccion.appendChild(botonVer);

    cuerpoDetalleEventos.appendChild(fila);
  });
}

function actualizarAvisoOpensearchConFiltros(filtros: {
  idTransaccion: string;
  idSession: string;
}): void {
  if (estadoDetalleLogs.opensearch.length === 0) {
    avisoDetalleOpensearch.hidden = true;
    avisoDetalleOpensearch.textContent = "";
    return;
  }

  const coincide = estadoDetalleLogs.opensearch.every((registro) => {
    const coincideTx =
      !filtros.idTransaccion ||
      registro.idTransaccion === filtros.idTransaccion;
    const coincideSession =
      !filtros.idSession || registro.idSession === filtros.idSession;
    return coincideTx && coincideSession;
  });

  if (!coincide) {
    avisoDetalleOpensearch.hidden = false;
    avisoDetalleOpensearch.textContent =
      "⚠️ La data pegada no coincide con el idTransaccion/idSession actuales. Ajusta los filtros o pega el JSON correcto.";
  } else {
    avisoDetalleOpensearch.hidden = true;
    avisoDetalleOpensearch.textContent = "";
  }
}

async function copiarQueryDetalleSolo(): Promise<string | null> {
  const filtros = obtenerFiltrosDetalleActual();
  const query = construirQueryDetalleOpensearch(
    filtros.idTransaccion,
    filtros.idSession
  );

  if (!query) {
    mostrarEstadoDetalleLogs(
      "Ingresa idTransaccion o idSession para construir la query.",
      "alerta"
    );
    return null;
  }

  try {
    botonCopiarQueryDetalle.disabled = true;
    await copiarTextoAlPortapapeles(query);
    mostrarEstadoDetalleLogs("Query copiada al portapapeles.", "exito");
    return query;
  } catch (error) {
    console.error("No se pudo copiar la query de detalle:", error);
    mostrarEstadoDetalleLogs(
      "No se pudo copiar la query. Copia manualmente el texto generado.",
      "error"
    );
    return null;
  } finally {
    botonCopiarQueryDetalle.disabled = false;
  }
}

function ordenarPorFechaAsc<T>(
  registros: T[],
  selector: (item: T) => Date
): T[] {
  return [...registros].sort((a, b) => {
    const fechaA = selector(a).getTime();
    const fechaB = selector(b).getTime();
    return fechaA - fechaB;
  });
}

async function manejarGenerarDetalle(): Promise<void> {
  const filtros = obtenerFiltrosDetalleActual();
  const query = construirQueryDetalleOpensearch(
    filtros.idTransaccion,
    filtros.idSession
  );

  if (!query) {
    mostrarEstadoDetalleLogs(
      "Indica al menos idTransaccion o idSession para generar los datos.",
      "alerta"
    );
    return;
  }

  botonGenerarDetalle.disabled = true;
  botonGenerarDetalle.textContent = "Generando...";
  botonCopiarQueryDetalle.disabled = true;
  mostrarEstadoDetalleLogs(
    "Copiando query y consultando PostgreSQL...",
    "info"
  );

  try {
    await copiarTextoAlPortapapeles(query);
    estadoDetalleLogs.filtros = filtros;
    actualizarAvisoOpensearchConFiltros(filtros);

    const respuesta = await window.electronAPI.consultarDetalleDeLogs(filtros);
    const accionesNormalizadas = respuesta.acciones.map(normalizarAccionDesdeBD);
    const eventosNormalizados = respuesta.eventos.map(normalizarEventoDesdeBD);

    estadoDetalleLogs.logacciones = ordenarPorFechaAsc(
      accionesNormalizadas,
      (registro) => registro.fecha
    );
    estadoDetalleLogs.logeventos = ordenarPorFechaAsc(
      eventosNormalizados,
      (registro) => registro.fecha
    );

    renderizarDetalleAcciones(estadoDetalleLogs.logacciones);
    renderizarDetalleEventos(estadoDetalleLogs.logeventos);
    mostrarEstadoDetalleLogs(
      "Query copiada. Ejecuta la búsqueda en Opensearch y pega el JSON. Datos de PostgreSQL listos.",
      "exito"
    );
  } catch (error) {
    console.error("Error al generar el detalle de logs:", error);
    const mensaje =
      error instanceof Error ? error.message : "No se pudo generar el detalle.";
    mostrarEstadoDetalleLogs(`Error: ${mensaje}`, "error");
  } finally {
    botonGenerarDetalle.disabled = false;
    botonGenerarDetalle.textContent = "Generar data";
    botonCopiarQueryDetalle.disabled = false;
  }
}

function normalizarHitDetalleOpensearch(
  hit: unknown
): LogDetalleOpensearch | null {
  const conFuente =
    (hit as { _source?: unknown })._source ??
    (hit as { source?: unknown }).source ??
    hit;

  if (!conFuente || typeof conFuente !== "object") {
    return null;
  }

  const fuente = conFuente as Record<string, unknown>;
  const fechaIso =
    (fuente["@timestamp"] as string | undefined) ||
    (fuente.timestamp as string | undefined);

  if (!fechaIso) {
    return null;
  }

  const fechaEvento = new Date(fechaIso);
  if (Number.isNaN(fechaEvento.getTime())) {
    return null;
  }

  const data = (fuente.data as { message?: unknown }) || {};
  const mensaje = data.message ?? fuente.message;

  return {
    fechaEvento,
    urlService: normalizarTextoPlano(fuente.urlService),
    codeStudent: normalizarTextoPlano(
      fuente.code_student ?? fuente.codeStudent
    ),
    codeEmplid: normalizarTextoPlano(fuente.code_emplid ?? fuente.codeEmplid),
    action: normalizarTextoPlano(fuente.action),
    message: normalizarTextoPlano(mensaje),
    status: normalizarTextoPlano(fuente.status),
    idTransaccion: normalizarTextoPlano(fuente.idTransaccion),
    idSession: normalizarTextoPlano(fuente.idSession),
    data: fuente.data,
  };
}

function parsearRespuestaDetalleOpensearch(
  contenido: string
): LogDetalleOpensearch[] {
  const json = parsearContenidoJsonLaxo(contenido);

  const hits = extraerHitsDeRespuesta(json);
  if (!hits || hits.length === 0) {
    return [];
  }

  return hits
    .map(normalizarHitDetalleOpensearch)
    .filter(
      (registro): registro is LogDetalleOpensearch => registro !== null
    );
}

function construirFirmaDetalleOpensearch(
  registro: LogDetalleOpensearch
): string {
  const base = {
    urlService: registro.urlService,
    fechaEvento: registro.fechaEvento.getTime(),
    codeStudent: registro.codeStudent,
    codeEmplid: registro.codeEmplid,
    action: registro.action,
    message: registro.message,
    status: registro.status,
    idTransaccion: registro.idTransaccion,
    idSession: registro.idSession,
    data: registro.data,
  };

  try {
    return JSON.stringify(base);
  } catch (error) {
    console.warn("No se pudo serializar registro de detalle:", error);
    return [
      registro.urlService,
      registro.fechaEvento.getTime(),
      registro.codeStudent,
      registro.codeEmplid,
      registro.action,
      registro.message,
      registro.status,
      registro.idTransaccion,
      registro.idSession,
      normalizarCampoData(registro.data),
    ].join("|");
  }
}

function deduplicarDetalleOpensearch(
  registros: LogDetalleOpensearch[]
): LogDetalleOpensearch[] {
  const firmas = new Set<string>();
  const unicos: LogDetalleOpensearch[] = [];

  registros.forEach((registro) => {
    const firma = construirFirmaDetalleOpensearch(registro);
    if (firmas.has(firma)) {
      return;
    }
    firmas.add(firma);
    unicos.push(registro);
  });

  return unicos;
}

async function cargarDetalleDesdeJson(
  contenido: string,
  origen: "portapapeles" | "archivo"
): Promise<void> {
  mostrarEstadoDetalleLogs("Procesando datos de Opensearch...", "info");
  try {
    const registros = deduplicarDetalleOpensearch(
      parsearRespuestaDetalleOpensearch(contenido)
    );
    estadoDetalleLogs.opensearch = ordenarPorFechaAsc(
      registros,
      (registro) => registro.fechaEvento
    );
    renderizarDetalleOpensearch(estadoDetalleLogs.opensearch);

    if (registros.length === 0) {
      mostrarEstadoDetalleLogs(
        "El JSON no tiene hits con datos para mostrar.",
        "alerta"
      );
      return;
    }

    const filtros = obtenerFiltrosDetalleActual();
    actualizarAvisoOpensearchConFiltros(filtros);

    mostrarEstadoDetalleLogs(
      `Datos cargados desde ${
        origen === "archivo" ? "archivo" : "portapapeles"
      }.`,
      "exito"
    );
  } catch (error) {
    console.error("No se pudo procesar el JSON del detalle:", error);
    const mensaje =
      error instanceof Error
        ? error.message
        : "Error desconocido al leer el JSON.";
    mostrarEstadoDetalleLogs(mensaje, "error");
  }
}

async function manejarPegadoDetalleOpensearch(): Promise<void> {
  if (!navigator.clipboard?.readText) {
    mostrarEstadoDetalleLogs(
      "Tu entorno no permite leer texto del portapapeles.",
      "alerta"
    );
    return;
  }

  try {
    botonDetallePegarJson.disabled = true;
    const contenido = await navigator.clipboard.readText();
    if (!contenido) {
      mostrarEstadoDetalleLogs(
        "El portapapeles está vacío o no contiene texto.",
        "alerta"
      );
      return;
    }

    await cargarDetalleDesdeJson(contenido, "portapapeles");
  } finally {
    botonDetallePegarJson.disabled = false;
  }
}

async function manejarCargaArchivoDetalleOpensearch(): Promise<void> {
  const archivo = inputArchivoDetalleOpensearch.files?.[0];
  if (!archivo) {
    return;
  }

  try {
    botonDetalleSubirJson.disabled = true;
    mostrarEstadoDetalleLogs(`Leyendo ${archivo.name}...`, "info");
    const contenido = await leerArchivoComoTexto(archivo);
    await cargarDetalleDesdeJson(contenido, "archivo");
  } finally {
    botonDetalleSubirJson.disabled = false;
    inputArchivoDetalleOpensearch.value = "";
  }
}

/**
 * Alterna la visibilidad del menú lateral para liberar espacio al contenido.
 */
function alternarMenuLateral(): void {
  const menuEstaColapsado = appLayout.classList.toggle(CLASE_MENU_COLAPSADO);
  if (textoToggleMenu) {
    textoToggleMenu.textContent = menuEstaColapsado ? "Mostrar" : "Ocultar";
  }
  botonToggleMenu.setAttribute(
    "aria-label",
    menuEstaColapsado ? "Mostrar menú lateral" : "Ocultar menú lateral"
  );
  botonToggleMenu.setAttribute(
    "aria-expanded",
    (!menuEstaColapsado).toString()
  );
  redimensionarGraficos();
}

/**
 * Fuerza el recalculo de tamaños de los gráficos tras cambios de layout (abrir/cerrar menú).
 * Útil porque el evento de redimensionamiento no siempre dispara al ajustar la grilla interna.
 */
function redimensionarGraficos(): void {
  requestAnimationFrame(() => {
    graficosPorAccion.forEach((instancias) => {
      instancias.duracion?.resize();
      instancias.conteo?.resize();
    });
    graficoErroresPorHora?.resize();
  });
}

/**
 * Dibuja un rectángulo redondeado en un contexto canvas.
 */
function trazarRectRedondeado(
  contexto: CanvasRenderingContext2D,
  x: number,
  y: number,
  ancho: number,
  alto: number,
  radio = 12
): void {
  const r = Math.min(radio, ancho / 2, alto / 2);
  contexto.beginPath();
  contexto.moveTo(x + r, y);
  contexto.lineTo(x + ancho - r, y);
  contexto.quadraticCurveTo(x + ancho, y, x + ancho, y + r);
  contexto.lineTo(x + ancho, y + alto - r);
  contexto.quadraticCurveTo(x + ancho, y + alto, x + ancho - r, y + alto);
  contexto.lineTo(x + r, y + alto);
  contexto.quadraticCurveTo(x, y + alto, x, y + alto - r);
  contexto.lineTo(x, y + r);
  contexto.quadraticCurveTo(x, y, x + r, y);
  contexto.closePath();
}

/**
 * Convierte un canvas existente en un elemento imagen listo para dibujar en otro lienzo.
 */
async function imagenDesdeCanvas(
  lienzo: HTMLCanvasElement
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    let dataUrl: string;
    try {
      dataUrl = lienzo.toDataURL("image/png");
    } catch (error) {
      reject(
        new Error(
          "No se pudo leer el gráfico porque el lienzo está marcado como tainted."
        )
      );
      return;
    }
    const imagen = new Image();
    imagen.onload = () => resolve(imagen);
    imagen.onerror = () =>
      reject(new Error("No se pudo leer el contenido del gráfico."));
    imagen.src = dataUrl;
  });
}

/**
 * Construye un canvas que replica visualmente la sección de gráficos (sin usar foreignObject)
 * combinando textos y los lienzos de Chart.js ya renderizados.
 */
async function construirImagenDeGraficos(
  contenedor: HTMLElement
): Promise<HTMLCanvasElement> {
  const rectContenedor = contenedor.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(Math.round(rectContenedor.width * dpr), 1);
  canvas.height = Math.max(Math.round(rectContenedor.height * dpr), 1);

  const contexto = canvas.getContext("2d");
  if (!contexto) {
    throw new Error("No se pudo preparar el lienzo para exportar.");
  }
  contexto.scale(dpr, dpr);

  // Fondo general
  contexto.fillStyle = COLOR_FONDO || "#f5f5f5";
  contexto.fillRect(0, 0, rectContenedor.width, rectContenedor.height);

  const tarjetas = Array.from(
    contenedor.querySelectorAll(".grafico")
  ) as HTMLDivElement[];
  for (const tarjeta of tarjetas) {
    const rectTarjeta = tarjeta.getBoundingClientRect();
    const x = rectTarjeta.left - rectContenedor.left;
    const y = rectTarjeta.top - rectContenedor.top;
    trazarRectRedondeado(
      contexto,
      x,
      y,
      rectTarjeta.width,
      rectTarjeta.height,
      12
    );
    contexto.fillStyle = COLOR_PANEL || "#ffffff";
    contexto.fill();
    contexto.strokeStyle = COLOR_BORDE || "#e5e7eb";
    contexto.stroke();

    const titulo = tarjeta.querySelector("h3")?.textContent ?? "";
    const descripcion = tarjeta.querySelector("p")?.textContent ?? "";
    contexto.fillStyle = "#111827";
    contexto.font = "700 16px 'Inter', system-ui, sans-serif";
    contexto.fillText(titulo, x + 16, y + 22);
    contexto.fillStyle = "#4b5563";
    contexto.font = "400 14px 'Inter', system-ui, sans-serif";
    contexto.fillText(descripcion, x + 16, y + 42);

    const lienzo = tarjeta.querySelector("canvas") as HTMLCanvasElement | null;
    if (lienzo) {
      const rectLienzo = lienzo.getBoundingClientRect();
      const img = await imagenDesdeCanvas(lienzo);
      const posX = rectLienzo.left - rectContenedor.left;
      const posY = rectLienzo.top - rectContenedor.top;
      const anchoVisible = rectLienzo.width;
      const altoVisible = rectLienzo.height;
      contexto.drawImage(img, posX, posY, anchoVisible, altoVisible);
    }
  }

  return canvas;
}

async function copiarGraficosDeAccionComoImagen(accion: string): Promise<void> {
  const contenedorAccion = contenedoresGraficosPorAccion.get(accion);
  if (!contenedorAccion || contenedorGraficos.hidden) {
    mostrarEstadoDeConsulta(
      "No hay gráficos disponibles para copiar.",
      "alerta"
    );
    return;
  }

  if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
    mostrarEstadoDeConsulta(
      "Tu entorno no permite copiar imágenes al portapapeles.",
      "alerta"
    );
    return;
  }

  try {
    modalCopiarConfirmar.disabled = true;
    modalCopiarConfirmar.textContent = "Copiando...";
    const canvas = await construirImagenDeGraficos(contenedorAccion);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((resultado) => {
        if (resultado) {
          resolve(resultado);
        } else {
          reject(new Error("No se pudo preparar la imagen para copiar."));
        }
      });
    });
    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": blob,
      }),
    ]);
    mostrarEstadoDeConsulta("Gráficos copiados como imagen.", "exito");
    cerrarModalCopiarGraficos();
  } catch (error) {
    console.error("Error al copiar gráficos:", error);
    const mensaje =
      error instanceof Error ? error.message : "No se pudo copiar la imagen.";
    mostrarEstadoDeConsulta(mensaje, "error");
  } finally {
    modalCopiarConfirmar.disabled = false;
    modalCopiarConfirmar.textContent = "Copiar";
  }
}

async function copiarGraficoErroresComoImagen(): Promise<void> {
  if (contenedorGraficoOpensearch.hidden) {
    return;
  }

  if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
    mostrarEstadoDeOpensearch(
      "Tu entorno no permite copiar imágenes al portapapeles.",
      "alerta"
    );
    return;
  }

  const tarjeta = contenedorGraficoOpensearch.querySelector(
    ".grafico"
  ) as HTMLDivElement | null;
  if (!tarjeta) {
    mostrarEstadoDeOpensearch("No se encontró el gráfico para copiar.", "alerta");
    return;
  }

  try {
    botonCopiarGraficoErrores.disabled = true;
    const lienzo = tarjeta.querySelector("canvas") as HTMLCanvasElement | null;
    if (!lienzo) {
      mostrarEstadoDeOpensearch("No se encontró el lienzo del gráfico.", "alerta");
      return;
    }
    const img = await imagenDesdeCanvas(lienzo);
    const rect = tarjeta.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(Math.round(rect.width * dpr), 1);
    canvas.height = Math.max(Math.round(rect.height * dpr), 1);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("No se pudo preparar el lienzo.");
    }
    ctx.scale(dpr, dpr);
    ctx.fillStyle = COLOR_PANEL || "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.drawImage(img, 0, 0, rect.width, rect.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((resultado) => {
        if (resultado) {
          resolve(resultado);
        } else {
          reject(new Error("No se pudo preparar la imagen para copiar."));
        }
      });
    });

    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": blob,
      }),
    ]);
    mostrarEstadoDeOpensearch("Gráfico copiado como imagen.", "exito");
  } catch (error) {
    console.error("Error al copiar gráfico de errores:", error);
    const mensaje =
      error instanceof Error ? error.message : "No se pudo copiar la imagen.";
    mostrarEstadoDeOpensearch(mensaje, "error");
  } finally {
    botonCopiarGraficoErrores.disabled = false;
  }
}

async function copiarGraficosDeAccionesSeleccionadas(): Promise<void> {
  const acciones = ordenAccionesCopia.filter((accion) =>
    accionesSeleccionadasParaCopiar.has(accion)
  );
  if (acciones.length === 0) {
    mostrarEstadoDeConsulta(
      "Selecciona al menos un par de gráficos para copiar.",
      "alerta"
    );
    return;
  }

  const contenedores = acciones
    .map((accion) => contenedoresGraficosPorAccion.get(accion))
    .filter((c): c is HTMLDivElement => Boolean(c));

  if (contenedores.length === 0) {
    mostrarEstadoDeConsulta(
      "No se encontraron contenedores de gráficos para las acciones seleccionadas.",
      "alerta"
    );
    return;
  }

  try {
    modalCopiarConfirmar.disabled = true;
    modalCopiarConfirmar.textContent = "Copiando...";

    const capturas = await Promise.all(
      contenedores.map((contenedor) => construirImagenDeGraficos(contenedor))
    );

    const ancho = Math.max(...capturas.map((c) => c.width));
    const alto =
      capturas.reduce((acc, c) => acc + c.height, 0) +
      Math.max(0, (capturas.length - 1) * 24);
    const lienzoFinal = document.createElement("canvas");
    lienzoFinal.width = ancho;
    lienzoFinal.height = alto;
    const ctx = lienzoFinal.getContext("2d");
    if (!ctx) {
      throw new Error("No se pudo preparar el lienzo final.");
    }

    let offsetY = 0;
    capturas.forEach((cap) => {
      ctx.drawImage(cap, 0, offsetY);
      offsetY += cap.height + 24;
    });

    const blob = await new Promise<Blob>((resolve, reject) => {
      lienzoFinal.toBlob((resultado) => {
        if (resultado) {
          resolve(resultado);
        } else {
          reject(new Error("No se pudo preparar la imagen para copiar."));
        }
      });
    });

    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": blob,
      }),
    ]);
    mostrarEstadoDeConsulta("Gráficos copiados como imagen.", "exito");
    cerrarModalCopiarGraficos();
  } catch (error) {
    console.error("Error al copiar gráficos:", error);
    const mensaje =
      error instanceof Error ? error.message : "No se pudo copiar la imagen.";
    mostrarEstadoDeConsulta(mensaje, "error");
  } finally {
    modalCopiarConfirmar.disabled = false;
    modalCopiarConfirmar.textContent = "Copiar";
  }
}

function abrirModalCopiarGraficos(): void {
  if (contenedorGraficos.hidden || graficosPorAccion.size === 0) {
    mostrarEstadoDeConsulta(
      "Genera datos antes de copiar los gráficos.",
      "alerta"
    );
    return;
  }

  modalCopiarGraficos.hidden = false;
}

function cerrarModalCopiarGraficos(): void {
  modalCopiarGraficos.hidden = true;
}

function cerrarModalDetallePunto(): void {
  modalDetallePunto.hidden = true;
  modalDetallePuntoCuerpo.innerHTML = "";
}

function obtenerRegistrosParaPunto(
  accion: string,
  dia: string,
  etiquetaHora: string
): RegistroNormalizado[] {
  return estadoDashboard.registrosCrudos.filter((registro) => {
    if (registro.accion !== accion) {
      return false;
    }

    const fechaTruncada = new Date(registro.fechaEvento);
    fechaTruncada.setSeconds(0, 0);
    const diaRegistro = obtenerIdDia(fechaTruncada);
    const horaRegistro = formatearHoraParaEtiqueta(fechaTruncada);
    return diaRegistro === dia && horaRegistro === etiquetaHora;
  });
}

function mostrarDetalleDeRegistros(
  accion: string,
  dia: string,
  etiquetaHora: string,
  registros: RegistroNormalizado[]
): void {
  modalDetallePuntoTitulo.textContent = `Registros - ${accion} (${dia} ${etiquetaHora})`;
  modalDetallePuntoCuerpo.innerHTML = "";

  if (registros.length === 0) {
    const filaVacia = document.createElement("tr");
    filaVacia.className = "tabla-detalle__vacio";
    const celda = document.createElement("td");
    celda.colSpan = 6;
    celda.textContent = "No se encontraron registros para este punto.";
    filaVacia.appendChild(celda);
    modalDetallePuntoCuerpo.appendChild(filaVacia);
  } else {
    registros
      .sort((a, b) => a.fechaEvento.getTime() - b.fechaEvento.getTime())
      .forEach((registro) => {
        const fila = document.createElement("tr");
        const celdas = [
          formatearFechaCorta(registro.fechaEvento),
          registro.accion,
          registro.tiempo.toString(),
          registro.idTransaccion || "—",
          registro.idSesion || "—",
        ];
        celdas.forEach((valor) => {
          const td = document.createElement("td");
          td.textContent = valor;
          fila.appendChild(td);
        });

        const celdaStatus = document.createElement("td");
        celdaStatus.appendChild(crearBadgeEstadoIcono(registro.status));
        fila.appendChild(celdaStatus);

        const celdaDetalle = document.createElement("td");
        const botonDetalle = document.createElement("button");
        botonDetalle.className = "boton-icono-ghost boton-icono-ghost--sm";
        botonDetalle.type = "button";
        botonDetalle.innerHTML =
          '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 5c-4.5 0-8.3 2.9-10 7 1.7 4.1 5.5 7 10 7s8.3-2.9 10-7c-1.7-4.1-5.5-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path></svg>';
        botonDetalle.title = "Ver detalle en Logs";
        botonDetalle.addEventListener("click", () => {
          if (!registro.idTransaccion && !registro.idSesion) {
            mostrarEstadoDetalleLogs(
              "El registro no tiene idTransaccion ni idSession.",
              "alerta"
            );
            return;
          }
          inputDetalleIdTransaccion.value = registro.idTransaccion;
          inputDetalleIdSession.value = registro.idSesion;
          actualizarAvisoOpensearchConFiltros(obtenerFiltrosDetalleActual());
          cambiarSeccion("detalle-logs");
          void manejarGenerarDetalle();
          cerrarModalDetallePunto();
        });
        celdaDetalle.appendChild(botonDetalle);
        fila.appendChild(celdaDetalle);
        modalDetallePuntoCuerpo.appendChild(fila);
      });
  }

  modalDetallePunto.hidden = false;
}

function manejarClickEnGrafico(
  accion: string,
  evento: unknown,
  canvas: HTMLCanvasElement
): void {
  const grafico = Chart.getChart(canvas);
  if (!grafico) {
    return;
  }

  const elementos = grafico.getElementsAtEventForMode(
    evento as unknown as Event,
    "nearest",
    { intersect: true },
    false
  );

  if (!elementos || elementos.length === 0) {
    return;
  }

  const indice = elementos[0].index;
  const indiceDataset = elementos[0].datasetIndex;
  const etiquetaHora = grafico.data.labels?.[indice];
  const dataset = grafico.data.datasets?.[indiceDataset];
  const dia = dataset?.label;

  if (
    typeof etiquetaHora !== "string" ||
    typeof dia !== "string" ||
    !etiquetaHora ||
    !dia
  ) {
    return;
  }

  const registros = obtenerRegistrosParaPunto(accion, dia, etiquetaHora);
  mostrarDetalleDeRegistros(accion, dia, etiquetaHora, registros);
}

/**
 * Convierte el contenido de un CSV en registros crudos con las columnas esperadas.
 * Asume cabecera con los nombres de columna: fecha, accion, tiempo.
 */
function parsearCsvEnRegistros(contenido: string): RegistroCrudo[] {
  const lineas = contenido
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter((linea) => linea.length > 0);

  if (lineas.length === 0) {
    return [];
  }

  const delimitador = obtenerDelimitador(lineas[0]);
  const cabeceras = lineas[0].split(delimitador).map((celda) => {
    return celda.replace(/['"]/g, "").trim().toLowerCase();
  });

  const indiceFecha = cabeceras.findIndex(
    (celda) => celda.replace(/['"]/g, "").trim().toLowerCase() === "fecha"
  );
  const indiceAccion = cabeceras.findIndex(
    (celda) => celda.replace(/['"]/g, "").trim().toLowerCase() === "accion"
  );
  const indiceTiempo = cabeceras.findIndex(
    (celda) => celda.replace(/['"]/g, "").trim().toLowerCase() === "tiempo"
  );

  const posicionFecha = indiceFecha >= 0 ? indiceFecha : 0;
  const posicionAccion = indiceAccion >= 0 ? indiceAccion : 1;
  const posicionTiempo = indiceTiempo >= 0 ? indiceTiempo : 2;

  return lineas.slice(1).reduce<RegistroCrudo[]>((acumulado, linea) => {
    const columnas = linea
      .split(delimitador)
      .map((celda) => celda.replace(/['"]/g, "").trim().toLowerCase());

    if (
      columnas.length <= Math.max(posicionFecha, posicionAccion, posicionTiempo)
    ) {
      return acumulado;
    }

    const registro: RegistroCrudo = {
      fecha: columnas[posicionFecha],
      accion: columnas[posicionAccion],
      tiempo: columnas[posicionTiempo],
    };

    if (registro.fecha && registro.accion && registro.tiempo) {
      acumulado.push(registro);
    }

    return acumulado;
  }, []);
}

/**
 * Estructuras auxiliares para construir series independientes por día.
 * Permite trazar múltiples líneas en el mismo eje de tiempo (hh:mm) y comparar jornadas.
 */
interface SeriePorDia {
  dia: string;
  promediosPorHora: (number | null)[];
  conteosPorHora: (number | null)[];
}

interface DatosGraficosPorDia {
  etiquetasHoras: string[];
  seriesPorDia: SeriePorDia[];
  maximoPromedio: number;
  maximoConteo: number;
}

const PALETA_COLORES = [
  "#1f6feb",
  "#0d9488",
  "#f97316",
  "#8b5cf6",
  "#e11d48",
  "#10b981",
  "#0ea5e9",
  "#f59e0b",
];

function colorConOpacidad(hex: string, opacidad: number): string {
  const limpio = hex.replace("#", "");
  const hexNormalizado =
    limpio.length === 3
      ? limpio
          .split("")
          .map((caracter) => caracter + caracter)
          .join("")
      : limpio;
  const r = parseInt(hexNormalizado.substring(0, 2), 16);
  const g = parseInt(hexNormalizado.substring(2, 4), 16);
  const b = parseInt(hexNormalizado.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacidad})`;
}

function obtenerColorDeSerie(indice: number): string {
  return PALETA_COLORES[indice % PALETA_COLORES.length];
}

function obtenerIdDia(fecha: Date): string {
  const year = fecha.getFullYear();
  const mes = `${fecha.getMonth() + 1}`.padStart(2, "0");
  const dia = `${fecha.getDate()}`.padStart(2, "0");
  return `${year}-${mes}-${dia}`;
}

function formatearHoraParaEtiqueta(fecha: Date): string {
  return fecha.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function obtenerMaximoEnSeries(
  series: SeriePorDia[],
  selector: (serie: SeriePorDia) => (number | null)[]
): number {
  const valores = series.flatMap((serie) =>
    selector(serie).filter(
      (valor): valor is number => valor !== null && !Number.isNaN(valor)
    )
  );
  if (valores.length === 0) {
    return 0;
  }
  return Math.max(...valores);
}

const pluginEtiquetasBarras = {
  id: "etiquetasBarras",
  afterDatasetsDraw(chart: Grafico): void {
    const { ctx } = chart;
    ctx.save();
    const datasets = chart.data.datasets as Array<{
      data?: Array<number | null | undefined>;
    }>;

    datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      const elementos = meta.data as unknown as Array<{
        getProps: (
          props: Array<"x" | "y" | "base">,
          final: boolean
        ) => { x: number; y: number; base: number };
      }>;

      elementos.forEach((elemento, indice) => {
        const valor = dataset.data?.[indice];
        if (
          valor === null ||
          valor === undefined ||
          typeof valor !== "number"
        ) {
          return;
        }

        const { x, y, base } = elemento.getProps(["x", "y", "base"], true);
        const altura = base - y;
        if (altura < 14) {
          return;
        }

        ctx.fillStyle = "#111827";
        ctx.font = "bold 10px 'Inter', system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(valor.toString(), x, y + altura / 2);
      });
    });
    ctx.restore();
  },
};

/**
 * Calcula las métricas necesarias para los gráficos agrupando por día y hora (minuto truncado).
 * Cada día se convierte en una serie independiente para poder comparar visualmente.
 */
function calcularMetricasParaGraficos(
  registrosFiltrados: RegistroNormalizado[]
): DatosGraficosPorDia {
  const horasEncontradas = new Set<string>();
  const mapaPorDia = new Map<
    string,
    Map<string, { tiemposSegundos: number[]; conteo: number }>
  >();

  registrosFiltrados.forEach((registro) => {
    const marcaPorMinuto = new Date(registro.fechaEvento);
    marcaPorMinuto.setSeconds(0, 0);
    const claveDia = obtenerIdDia(marcaPorMinuto);
    const claveHora = formatearHoraParaEtiqueta(marcaPorMinuto);
    horasEncontradas.add(claveHora);

    const mapaHoras = mapaPorDia.get(claveDia) ?? new Map();
    const agrupacionExistente = mapaHoras.get(claveHora) ?? {
      tiemposSegundos: [],
      conteo: 0,
    };

    agrupacionExistente.tiemposSegundos.push(
      convertirTiempoASegundos(registro.tiempo)
    );
    agrupacionExistente.conteo += 1;

    mapaHoras.set(claveHora, agrupacionExistente);
    mapaPorDia.set(claveDia, mapaHoras);
  });

  const etiquetasHoras = Array.from(horasEncontradas).sort();

  const seriesPorDia: SeriePorDia[] = Array.from(mapaPorDia.entries())
    .sort(([diaA], [diaB]) => diaA.localeCompare(diaB))
    .map(([dia, mapaHoras]) => {
      const promediosPorHora: (number | null)[] = [];
      const conteosPorHora: (number | null)[] = [];

      etiquetasHoras.forEach((hora) => {
        const agrupacion = mapaHoras.get(hora);
        if (!agrupacion) {
          promediosPorHora.push(null);
          conteosPorHora.push(null);
          return;
        }

        const sumaTiempos = agrupacion.tiemposSegundos.reduce(
          (acumulado, valor) => acumulado + valor,
          0
        );
        const promedio =
          agrupacion.conteo > 0 ? sumaTiempos / agrupacion.conteo : 0;

        promediosPorHora.push(promedio);
        conteosPorHora.push(agrupacion.conteo);
      });

      return { dia, promediosPorHora, conteosPorHora };
    });

  const maximoPromedio = obtenerMaximoEnSeries(
    seriesPorDia,
    (serie) => serie.promediosPorHora
  );
  const maximoConteo = obtenerMaximoEnSeries(
    seriesPorDia,
    (serie) => serie.conteosPorHora
  );

  return { etiquetasHoras, seriesPorDia, maximoPromedio, maximoConteo };
}

/**
 * Renderiza o actualiza el gráfico de duración promedio por minuto.
 * Respeta la regla de eje Y con mínimo 7 y máximo dinámico según los valores presentes.
 * Impacta en la claridad visual de las métricas de rendimiento de la aplicación monitoreada.
 */
function construirGraficoDeDuracion(
  canvas: HTMLCanvasElement,
  etiquetasHoras: string[],
  seriesPorDia: SeriePorDia[],
  maximoPromedio: number,
  accion: string
): Grafico {
  const datasets = seriesPorDia.map((serie, indice) => {
    const color = obtenerColorDeSerie(indice);
    return {
      label: serie.dia,
      data: serie.promediosPorHora,
      borderColor: color,
      backgroundColor: colorConOpacidad(color, 0.15),
      tension: 0,
      spanGaps: false,
      pointRadius: 2,
    };
  });

  const limiteSuperior = maximoPromedio > 7 ? Math.ceil(maximoPromedio) + 1 : 7;

  return new Chart(canvas, {
    type: "line",
    data: {
      labels: etiquetasHoras,
      datasets,
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      scales: {
        x: {
          type: "category",
          ticks: { color: "#374151", maxRotation: 0, autoSkip: true },
          grid: { color: "#e5e7eb" },
        },
        y: {
          max: limiteSuperior,
          beginAtZero: true,
          ticks: {
            color: "#374151",
            stepSize: 1,
            callback: (value) => value.toString(),
          },
          grid: { color: "#e5e7eb" },
        },
      },
      plugins: {
        legend: {
          display: true,
          labels: { color: "#111827", boxWidth: 16 },
        },
      },
      onClick: (evento) => {
        manejarClickEnGrafico(accion, evento, canvas);
      },
    },
  });
}

/**
 * Renderiza o actualiza el gráfico de conteo de transacciones por minuto.
 * Mantiene el mismo eje X que el gráfico de duración para facilitar la comparación visual.
 * Impacta en la comprensión de volumen de actividad durante el rango seleccionado.
 */
function construirGraficoDeConteo(
  canvas: HTMLCanvasElement,
  etiquetasHoras: string[],
  seriesPorDia: SeriePorDia[],
  maximoConteo: number,
  accion: string
): Grafico {
  const esUnSoloDia = seriesPorDia.length === 1;
  const datasets = seriesPorDia.map((serie, indice) => {
    const color = obtenerColorDeSerie(indice + 2); // Desplaza para variar frente al gráfico de duración
    const baseDataset = {
      label: serie.dia,
      data: serie.conteosPorHora,
      borderColor: color,
      backgroundColor: colorConOpacidad(color, esUnSoloDia ? 0.65 : 0.2),
    };

    if (esUnSoloDia) {
      return {
        ...baseDataset,
        borderRadius: 6,
        borderWidth: 1,
        maxBarThickness: 28,
      };
    }

    return {
      ...baseDataset,
      tension: 0,
      spanGaps: false,
      pointRadius: 2,
      fill: false,
    };
  });

  const limiteSuperior = Math.max(1, Math.ceil(maximoConteo) + 1);

  return new Chart(canvas, {
    type: esUnSoloDia ? "bar" : "line",
    data: {
      labels: etiquetasHoras,
      datasets,
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      scales: {
        x: {
          type: "category",
          ticks: { color: "#374151", maxRotation: 0, autoSkip: true },
          grid: { color: "#e5e7eb" },
        },
        y: {
          max: limiteSuperior,
          beginAtZero: true,
          ticks: {
            color: "#374151",
            stepSize: 1,
            callback: (value) => value.toString(),
          },
          grid: { color: "#e5e7eb" },
        },
      },
      plugins: {
        legend: {
          display: true,
          labels: { color: "#111827", boxWidth: 16 },
        },
      },
      onClick: (evento) => {
        manejarClickEnGrafico(accion, evento, canvas);
      },
    },
    plugins: [],
  });
}

function limpiarGraficosDeAcciones(): void {
  graficosPorAccion.forEach((instancias) => {
    instancias.duracion?.destroy();
    instancias.conteo?.destroy();
  });
  graficosPorAccion.clear();
  vistasGraficosPorAccion.clear();
  contenedoresGraficosPorAccion.clear();
  contenedorGraficos.innerHTML = "";
  contenedorGraficos.hidden = true;
  accionesSeleccionadasParaCopiar = new Set<string>();
  listaAccionesCopia.innerHTML = "";
  ordenAccionesCopia = [];
  sortableAcciones?.destroy();
  sortableAcciones = null;
  botonCopiarGraficos.disabled = true;
}

function actualizarListaAccionesParaCopiar(acciones: string[]): void {
  listaAccionesCopia.innerHTML = "";
  accionesSeleccionadasParaCopiar = new Set<string>();
  ordenAccionesCopia = [...acciones];
  if (acciones.length === 0) {
    modalCopiarConfirmar.disabled = true;
    return;
  }

  modalCopiarConfirmar.disabled = false;
  acciones.forEach((accion, indice) => {
    const item = document.createElement("label");
    item.className = "lista-acciones-copia__item";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "accion-copia";
    input.value = accion;
    input.checked = true;
    input.addEventListener("change", () => {
      if (input.checked) {
        accionesSeleccionadasParaCopiar.add(accion);
      } else {
        accionesSeleccionadasParaCopiar.delete(accion);
      }
      modalCopiarConfirmar.disabled = accionesSeleccionadasParaCopiar.size === 0;
    });
    accionesSeleccionadasParaCopiar.add(accion);

    const contenido = document.createElement("div");
    const titulo = document.createElement("p");
    titulo.className = "lista-acciones-copia__accion";
    titulo.textContent = accion;
    contenido.appendChild(titulo);

    item.appendChild(input);
    item.appendChild(contenido);
    listaAccionesCopia.appendChild(item);
  });

  modalCopiarConfirmar.disabled = accionesSeleccionadasParaCopiar.size === 0;

  if (sortableAcciones) {
    sortableAcciones.destroy();
  }

  if (typeof Sortable === "undefined") {
    console.warn("Sortable no está disponible en el entorno.");
    return;
  }

  sortableAcciones = new Sortable(listaAccionesCopia, {
    animation: 150,
    handle: ".lista-acciones-copia__item",
    ghostClass: "drag-ghost",
    onEnd: () => {
      const nuevoOrden = Array.from(
        listaAccionesCopia.querySelectorAll<HTMLInputElement>(
          'input[name="accion-copia"]'
        )
      ).map((input) => input.value);
      ordenAccionesCopia = nuevoOrden;
    },
  });
}

function renderizarGraficosParaAccion(
  accion: string,
  registrosAccion: RegistroNormalizado[]
): void {
  let vista = vistasGraficosPorAccion.get(accion);
  if (!vista) {
    vista = crearVistaGraficosParaAccion(accion);
    vistasGraficosPorAccion.set(accion, vista);
    contenedoresGraficosPorAccion.set(accion, vista.contenedor);
    contenedorGraficos.appendChild(vista.contenedor);
  }

  vista.tituloDuracion.textContent = `${TEXTO_BASE_TITULO_DURACION} - ${accion}`;
  vista.tituloConteo.textContent = `${TEXTO_BASE_TITULO_CONTEO} - ${accion}`;

  const { etiquetasHoras, seriesPorDia, maximoPromedio, maximoConteo } =
    calcularMetricasParaGraficos(registrosAccion);

  const previos = graficosPorAccion.get(accion);
  previos?.duracion?.destroy();
  previos?.conteo?.destroy();

  const graficoDuracion = construirGraficoDeDuracion(
    vista.canvasDuracion,
    etiquetasHoras,
    seriesPorDia,
    maximoPromedio,
    accion
  );
  const graficoConteo = construirGraficoDeConteo(
    vista.canvasConteo,
    etiquetasHoras,
    seriesPorDia,
    maximoConteo,
    accion
  );

  graficosPorAccion.set(accion, {
    duracion: graficoDuracion,
    conteo: graficoConteo,
  });
}

function renderizarTodosLosGraficosPorAccion(): void {
  limpiarGraficosDeAcciones();

  const accionesConDatos: string[] = [];
  estadoDashboard.accionesDisponibles.forEach((accion) => {
    const registrosAccion = estadoDashboard.registrosCrudos.filter(
      (registro) => registro.accion === accion
    );
    if (registrosAccion.length === 0) {
      return;
    }

    accionesConDatos.push(accion);
    renderizarGraficosParaAccion(accion, registrosAccion);
  });

  contenedorGraficos.hidden = accionesConDatos.length === 0;
  botonCopiarGraficos.disabled = accionesConDatos.length === 0;
  actualizarListaAccionesParaCopiar(accionesConDatos);
}

/**
 * Ejecuta la consulta manual a la base de datos usando el IPC expuesto por el preload.
 * Valida los filtros obligatorios y gestiona los estados de la UI durante los hasta 2 minutos de espera.
 * Impacta en el flujo principal del dashboard al conectar los filtros con los gráficos.
 */
async function manejarConsulta(): Promise<void> {
  const fechaInicio = inputFechaInicio.value;
  const fechaFin = inputFechaFin.value;

  if (!fechaInicio || !fechaFin) {
    mostrarEstadoDeConsulta(
      "Indique fecha inicio y fecha fin para consultar.",
      "alerta"
    );
    return;
  }

  bloquearUIDuranteCarga(true);
  contenedorGraficos.hidden = true;
  mostrarEstadoDeConsulta(
    "Cargando datos (puede tardar hasta 2 minutos)...",
    "info"
  );

  try {
    const respuesta = await window.electronAPI.ejecutarConsultaDeLogs({
      fechaInicioIso: new Date(fechaInicio).toISOString(),
      fechaFinIso: new Date(fechaFin).toISOString(),
    });

    cargarRegistrosEnDashboard(
      respuesta.registrosCrudos,
      "Datos obtenidos de la base de datos.",
      "Sin datos para el rango seleccionado."
    );
  } catch (error) {
    console.error("Error durante la consulta manual:", error);
    const mensaje =
      error instanceof Error ? error.message : "Error desconocido";
    mostrarEstadoDeConsulta(`Error al consultar: ${mensaje}`, "error");
    contenedorGraficos.hidden = true;
  } finally {
    bloquearUIDuranteCarga(false);
  }
}

/**
 * Maneja la carga de un archivo CSV y lo procesa como si fuera una consulta.
 * Permite usar los gráficos y filtros existentes sin tocar la base de datos.
 */
async function manejarCargaCsv(): Promise<void> {
  const archivo = inputArchivoCsv.files?.[0];
  if (!archivo) {
    return;
  }

  bloquearUIDuranteCarga(true, "csv");
  contenedorGraficos.hidden = true;
  mostrarEstadoDeConsulta(`Cargando ${archivo.name}...`, "info");

  try {
    const contenido = await leerArchivoComoTexto(archivo);
    const registrosCrudos = parsearCsvEnRegistros(contenido);

    cargarRegistrosEnDashboard(
      registrosCrudos,
      `Datos cargados desde ${archivo.name}.`,
      "El CSV no tiene registros válidos."
    );
  } catch (error) {
    console.error("Error durante la carga de CSV:", error);
    const mensaje =
      error instanceof Error ? error.message : "No se pudo cargar el CSV.";
    mostrarEstadoDeConsulta(`Error al cargar CSV: ${mensaje}`, "error");
    contenedorGraficos.hidden = true;
  } finally {
    bloquearUIDuranteCarga(false);
    inputArchivoCsv.value = "";
  }
}

botonConsultar.addEventListener("click", () => {
  void manejarConsulta();
});

botonCargarCsv.addEventListener("click", () => {
  inputArchivoCsv.click();
});

inputArchivoCsv.addEventListener("change", () => {
  void manejarCargaCsv();
});

botonToggleMenu.addEventListener("click", () => {
  alternarMenuLateral();
});

botonCopiarGraficos.addEventListener("click", () => {
  abrirModalCopiarGraficos();
});

modalCopiarConfirmar.addEventListener("click", () => {
  void copiarGraficosDeAccionesSeleccionadas();
});

modalCopiarCerrar?.addEventListener("click", () => {
  cerrarModalCopiarGraficos();
});

modalCopiarCancelar.addEventListener("click", () => {
  cerrarModalCopiarGraficos();
});

modalCopiarOverlay?.addEventListener("click", () => {
  cerrarModalCopiarGraficos();
});

botonCopiarQueryOpensearch.addEventListener("click", () => {
  void copiarQueryDeOpensearch();
});

botonPegarJson.addEventListener("click", () => {
  void manejarPegadoDeJson();
});

botonSubirJson.addEventListener("click", () => {
  inputArchivoOpensearch.click();
});

inputArchivoOpensearch.addEventListener("change", () => {
  void manejarCargaDeArchivoOpensearch();
});

selectorUrlService.addEventListener("change", () => {
  actualizarMensajesDisponibles(selectorUrlService.value);
  aplicarFiltrosDeOpensearch();
});

selectorDataMessage.addEventListener("change", () => {
  aplicarFiltrosDeOpensearch();
});

botonDescargarAlumnos.addEventListener("click", () => {
  descargarAlumnosAfectados();
});

botonDescargarFiltrado.addEventListener("click", () => {
  descargarFiltradoCompleto();
});

botonVerTablaFiltrada.addEventListener("click", () => {
  abrirModalTablaFiltrada();
});

botonCopiarGraficoErrores.addEventListener("click", () => {
  void copiarGraficoErroresComoImagen();
});

botonCopiarQueryDetalle.addEventListener("click", () => {
  void copiarQueryDetalleSolo();
});

botonGenerarDetalle.addEventListener("click", () => {
  void manejarGenerarDetalle();
});

botonDetallePegarJson.addEventListener("click", () => {
  void manejarPegadoDetalleOpensearch();
});

botonDetalleSubirJson.addEventListener("click", () => {
  inputArchivoDetalleOpensearch.click();
});

inputArchivoDetalleOpensearch.addEventListener("change", () => {
  void manejarCargaArchivoDetalleOpensearch();
});

inputDetalleIdTransaccion.addEventListener("input", () => {
  actualizarAvisoOpensearchConFiltros(obtenerFiltrosDetalleActual());
});

inputDetalleIdSession.addEventListener("input", () => {
  actualizarAvisoOpensearchConFiltros(obtenerFiltrosDetalleActual());
});

tablaFiltradaPrev.addEventListener("click", () => {
  paginaTablaFiltrada = Math.max(1, paginaTablaFiltrada - 1);
  renderizarTablaFiltrada();
});

tablaFiltradaNext.addEventListener("click", () => {
  const totalPaginas = obtenerTotalPaginasTablaFiltrada(
    estadoOpenSearch.registrosFiltrados.length
  );
  paginaTablaFiltrada = Math.min(totalPaginas, paginaTablaFiltrada + 1);
  renderizarTablaFiltrada();
});

modalTablaCerrar?.addEventListener("click", () => {
  cerrarModalTablaFiltrada();
});

overlayModalTabla?.addEventListener("click", () => {
  cerrarModalTablaFiltrada();
});

const overlayModalDetalle = modalDetalleOpensearch.querySelector(
  ".modal__overlay"
) as HTMLDivElement | null;
botonModalCerrar?.addEventListener("click", () => {
  cerrarModalDetallado();
});
overlayModalDetalle?.addEventListener("click", () => {
  cerrarModalDetallado();
});

modalDetallePuntoCerrar?.addEventListener("click", () => {
  cerrarModalDetallePunto();
});

overlayModalDetallePunto?.addEventListener("click", () => {
  cerrarModalDetallePunto();
});

itemsMenuSeccion.forEach((item) => {
  item.addEventListener("click", () => {
    const destino = item.dataset.section as SeccionActiva | undefined;
    if (
      item.classList.contains("menu-secundario__item--deshabilitado") ||
      item.getAttribute("aria-disabled") === "true"
    ) {
      return;
    }

    if (!destino) {
      return;
    }

    cambiarSeccion(destino);

    if (destino === "configuracion") {
      void cargarConfiguracionDeEnv();
    }
  });
});

gruposMenu.forEach((grupo) => {
  const cabecera = grupo.querySelector(
    ".menu-principal__grupo-cabecera"
  ) as HTMLDivElement | null;
  cabecera?.addEventListener("click", (evento) => {
    evento.stopPropagation();
    grupo.classList.toggle("abierto");
  });
});

formularioConfiguracion.addEventListener("submit", (evento) => {
  void manejarGuardadoDeConfiguracion(evento);
});

botonRecargarConfiguracion.addEventListener("click", () => {
  void cargarConfiguracionDeEnv();
});

gruposMenu.forEach((grupo) => {
  grupo.classList.remove("abierto");
});

renderizarDetalleOpensearch([]);
renderizarDetalleAcciones([]);
renderizarDetalleEventos([]);

cambiarSeccion(seccionActual);
void cargarConfiguracionDeEnv();
