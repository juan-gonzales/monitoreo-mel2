// Tipos locales declarados para mantener la legibilidad del renderer sin dependencias de importación en tiempo de ejecución.
interface RegistroCrudo {
  fecha: string;
  accion: string;
  tiempo: number | string;
}

type ChartConstructor = typeof import("chart.js")["Chart"];

// Chart se inyecta en el ámbito global mediante los scripts UMD declarados en index.html.
declare const Chart: ChartConstructor;

interface RegistroNormalizado {
  fechaEvento: Date;
  accion: string;
  tiempo: number;
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

interface ElectronAPI {
  ejecutarConsultaDeLogs: (fechas: {
    fechaInicioIso: string;
    fechaFinIso: string;
  }) => Promise<{
    registrosCrudos: RegistroCrudo[];
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
const contenedorFiltroAccion = document.getElementById(
  "contenedor-filtro-accion"
) as HTMLDivElement;
const botonCopiarGraficos = document.getElementById(
  "boton-copiar-graficos"
) as HTMLButtonElement;
const textoBotonCopiar = botonCopiarGraficos.querySelector(
  "span"
) as HTMLSpanElement;
const selectorAccion = document.getElementById(
  "filtro-accion"
) as HTMLSelectElement;
const tituloGraficoDuracion = document.getElementById(
  "titulo-grafico-duracion"
) as HTMLHeadingElement;
const tituloGraficoConteo = document.getElementById(
  "titulo-grafico-conteo"
) as HTMLHeadingElement;

const TEXTO_BASE_TITULO_DURACION = "Duración promedio por minuto";
const TEXTO_BASE_TITULO_CONTEO = "Cantidad de transacciones por minuto";

const lienzoGraficoDuracion = document.getElementById(
  "grafico-duracion"
) as HTMLCanvasElement;
const lienzoGraficoCantidad = document.getElementById(
  "grafico-cantidad"
) as HTMLCanvasElement;

type Grafico = InstanceType<ChartConstructor>;

let graficoDuracionPromedio: Grafico | undefined;
let graficoCantidadPorMinuto: Grafico | undefined;

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
const seccionDashboard = document.getElementById(
  "seccion-dashboard"
) as HTMLElement;
const seccionConfiguracion = document.getElementById(
  "seccion-configuracion"
) as HTMLElement;

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

type SeccionActiva = "dashboard" | "configuracion";
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
  selectorAccion.disabled = estaCargando;
  botonConsultar.textContent = estaCargando ? "Consultando..." : "Consultar";
  botonCargarCsv.textContent = estaCargando
    ? "Cargando CSV..."
    : "Consultar por CSV";
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

  seccionDashboard.hidden = seccion !== "dashboard";
  seccionConfiguracion.hidden = seccion !== "configuracion";
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
        !Number.isNaN(registro.tiempo)
    );

  if (registrosNormalizados.length === 0) {
    mostrarEstadoDeConsulta(mensajeSinDatos, "alerta");
    contenedorGraficos.hidden = true;
    contenedorFiltroAccion.hidden = true;
    return;
  }

  estadoDashboard.registrosCrudos = registrosNormalizados;
  const accionesUnicas = Array.from(
    new Set<string>(registrosNormalizados.map((registro) => registro.accion))
  ).sort();
  estadoDashboard.accionesDisponibles = accionesUnicas;

  poblarFiltroAccion();
  actualizarGraficosConFiltroSeleccionado();
  mostrarEstadoDeConsulta(mensajeExito, "exito");
}

/**
 * Construye las opciones del filtro secundario a partir de las acciones únicas en la data cargada.
 * No dispara consultas nuevas; simplemente actualiza el selector disponible en la UI.
 * Impacta en la navegabilidad y en el recalculo de gráficos sin tocar la base de datos.
 */
function poblarFiltroAccion(): void {
  selectorAccion.innerHTML = "";
  const opcionTodas = document.createElement("option");
  opcionTodas.value = "todas";
  opcionTodas.textContent = "Todas las acciones";
  selectorAccion.appendChild(opcionTodas);

  estadoDashboard.accionesDisponibles.forEach((accion) => {
    const opcion = document.createElement("option");
    opcion.value = accion;
    opcion.textContent = accion;
    selectorAccion.appendChild(opcion);
  });

  contenedorFiltroAccion.hidden =
    estadoDashboard.accionesDisponibles.length === 0;
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
  if (!graficoDuracionPromedio && !graficoCantidadPorMinuto) {
    return;
  }

  requestAnimationFrame(() => {
    graficoDuracionPromedio?.resize();
    graficoCantidadPorMinuto?.resize();
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
async function construirImagenDeGraficos(): Promise<HTMLCanvasElement> {
  const rectContenedor = contenedorGraficos.getBoundingClientRect();
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
    contenedorGraficos.querySelectorAll(".grafico")
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

async function copiarGraficosComoImagen(): Promise<void> {
  if (contenedorGraficos.hidden) {
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
    botonCopiarGraficos.disabled = true;
    textoBotonCopiar.textContent = "Copiando...";
    const canvas = await construirImagenDeGraficos();
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
  } catch (error) {
    console.error("Error al copiar gráficos:", error);
    const mensaje =
      error instanceof Error ? error.message : "No se pudo copiar la imagen.";
    mostrarEstadoDeConsulta(mensaje, "error");
  } finally {
    botonCopiarGraficos.disabled = false;
    textoBotonCopiar.textContent = "Copiar";
  }
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
    const datasets = chart.data
      .datasets as Array<{ data?: Array<number | null | undefined> }>;

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
function renderizarGraficoDeDuracion(
  etiquetasHoras: string[],
  seriesPorDia: SeriePorDia[],
  maximoPromedio: number
): void {
  if (graficoDuracionPromedio) {
    graficoDuracionPromedio.destroy();
  }

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

  const limiteSuperior =
    maximoPromedio > 7 ? Math.ceil(maximoPromedio) + 1 : 7;

  graficoDuracionPromedio = new Chart(lienzoGraficoDuracion, {
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
    },
  });
}

/**
 * Renderiza o actualiza el gráfico de conteo de transacciones por minuto.
 * Mantiene el mismo eje X que el gráfico de duración para facilitar la comparación visual.
 * Impacta en la comprensión de volumen de actividad durante el rango seleccionado.
 */
function renderizarGraficoDeConteo(
  etiquetasHoras: string[],
  seriesPorDia: SeriePorDia[],
  maximoConteo: number
): void {
  if (graficoCantidadPorMinuto) {
    graficoCantidadPorMinuto.destroy();
  }

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

  graficoCantidadPorMinuto = new Chart(lienzoGraficoCantidad, {
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
    },
    plugins: [],
  });
}

/**
 * Recalcula los gráficos aplicando el filtro de acción sin tocar la base de datos.
 * Se ejecuta tanto tras una nueva consulta como al cambiar el selector de acción.
 * Impacta en la respuesta interactiva de la UI, manteniendo la app fluida durante el post-procesamiento.
 */
function actualizarGraficosConFiltroSeleccionado(): void {
  const accionSeleccionada = selectorAccion.value;
  const textoAccionSeleccionada =
    selectorAccion.options[selectorAccion.selectedIndex]?.textContent ??
    accionSeleccionada;
  tituloGraficoDuracion.textContent = `${TEXTO_BASE_TITULO_DURACION} - ${textoAccionSeleccionada}`;
  tituloGraficoConteo.textContent = `${TEXTO_BASE_TITULO_CONTEO} - ${textoAccionSeleccionada}`;

  estadoDashboard.registrosFiltrados = estadoDashboard.registrosCrudos.filter(
    (registro) => {
      if (accionSeleccionada === "todas") {
        return true;
      }

      return registro.accion === accionSeleccionada;
    }
  );

  if (estadoDashboard.registrosFiltrados.length === 0) {
    mostrarEstadoDeConsulta(
      "No hay datos para la acción seleccionada.",
      "alerta"
    );
    contenedorGraficos.hidden = true;
    return;
  }

  const { etiquetasHoras, seriesPorDia, maximoPromedio, maximoConteo } =
    calcularMetricasParaGraficos(estadoDashboard.registrosFiltrados);

  contenedorGraficos.hidden = false;
  renderizarGraficoDeDuracion(etiquetasHoras, seriesPorDia, maximoPromedio);
  renderizarGraficoDeConteo(etiquetasHoras, seriesPorDia, maximoConteo);
  mostrarEstadoDeConsulta("Resultados listos.", "exito");
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

selectorAccion.addEventListener("change", () => {
  actualizarGraficosConFiltroSeleccionado();
});

botonToggleMenu.addEventListener("click", () => {
  alternarMenuLateral();
});

botonCopiarGraficos.addEventListener("click", () => {
  void copiarGraficosComoImagen();
});

itemsMenuSeccion.forEach((item) => {
  item.addEventListener("click", () => {
    const destino = item.dataset.section as SeccionActiva | undefined;
    if (!destino) {
      return;
    }

    cambiarSeccion(destino);

    if (destino === "configuracion") {
      void cargarConfiguracionDeEnv();
    }
  });
});

formularioConfiguracion.addEventListener("submit", (evento) => {
  void manejarGuardadoDeConfiguracion(evento);
});

botonRecargarConfiguracion.addEventListener("click", () => {
  void cargarConfiguracionDeEnv();
});

cambiarSeccion(seccionActual);
void cargarConfiguracionDeEnv();
