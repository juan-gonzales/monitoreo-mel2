// Tipos locales declarados para mantener la legibilidad del renderer sin dependencias de importación en tiempo de ejecución.
interface RegistroCrudo {
  fecha_evento: string;
  accion: string;
  tiempo: number | string;
}

type ChartConstructor = typeof import('chart.js')['Chart'];

// Chart se inyecta en el ámbito global mediante los scripts UMD declarados en index.html.
declare const Chart: ChartConstructor;

interface RegistroNormalizado {
  fechaEvento: Date;
  accion: string;
  tiempo: number;
}

interface EstadoDashboard {
  registrosCrudos: RegistroNormalizado[];
  registrosFiltrados: RegistroNormalizado[];
  accionesDisponibles: string[];
}

interface ElectronAPI {
  ejecutarConsultaDeLogs: (fechas: { fechaInicioIso: string; fechaFinIso: string }) => Promise<{
    registrosCrudos: RegistroCrudo[];
  }>;
}

interface Window {
  electronAPI: ElectronAPI;
}

const botonConsultar = document.getElementById('boton-consultar') as HTMLButtonElement;
const inputFechaInicio = document.getElementById('fecha-inicio') as HTMLInputElement;
const inputFechaFin = document.getElementById('fecha-fin') as HTMLInputElement;
const contenedorEstado = document.getElementById('estado-consulta') as HTMLDivElement;
const contenedorGraficos = document.getElementById('contenedor-graficos') as HTMLDivElement;
const contenedorFiltroAccion = document.getElementById('contenedor-filtro-accion') as HTMLDivElement;
const selectorAccion = document.getElementById('filtro-accion') as HTMLSelectElement;

const lienzoGraficoDuracion = document.getElementById('grafico-duracion') as HTMLCanvasElement;
const lienzoGraficoCantidad = document.getElementById('grafico-cantidad') as HTMLCanvasElement;

type Grafico = InstanceType<ChartConstructor>;

let graficoDuracionPromedio: Grafico | undefined;
let graficoCantidadPorMinuto: Grafico | undefined;

const estadoDashboard: EstadoDashboard = {
  registrosCrudos: [],
  registrosFiltrados: [],
  accionesDisponibles: []
};

/**
 * Ajusta el mensaje de estado visible para el usuario.
 * Muestra feedback claro para los escenarios de carga, error, éxito o falta de datos.
 * Impacta en la percepción de estabilidad y en la confianza del usuario durante la consulta manual.
 */
function mostrarEstadoDeConsulta(mensaje: string, tipo: 'info' | 'alerta' | 'error' | 'exito' = 'info'): void {
  contenedorEstado.textContent = mensaje;
  contenedorEstado.className = `estado ${tipo}`;
}

/**
 * Habilita o deshabilita los controles de la UI durante operaciones largas.
 * Evita que el usuario dispare múltiples consultas simultáneas o cambie filtros mientras se cargan datos.
 * Impacta en la experiencia de uso al prevenir bloqueos o estados inconsistentes.
 */
function bloquearUIDuranteCarga(estaCargando: boolean): void {
  botonConsultar.disabled = estaCargando;
  inputFechaInicio.disabled = estaCargando;
  inputFechaFin.disabled = estaCargando;
  selectorAccion.disabled = estaCargando;
  botonConsultar.textContent = estaCargando ? 'Consultando...' : 'Consultar';
}

/**
 * Convierte un registro crudo en un objeto con tipos apropiados para cálculo.
 * Normaliza la fecha a un objeto Date y asegura que el tiempo esté en número.
 * Impacta en la transformacion de datos previa a los cálculos de métricas.
 */
function normalizarRegistroCrudo(registroCrudo: RegistroCrudo): RegistroNormalizado {
  return {
    fechaEvento: new Date(registroCrudo.fecha_evento),
    accion: registroCrudo.accion,
    tiempo: Number(registroCrudo.tiempo)
  };
}

/**
 * Construye las opciones del filtro secundario a partir de las acciones únicas en la data cargada.
 * No dispara consultas nuevas; simplemente actualiza el selector disponible en la UI.
 * Impacta en la navegabilidad y en el recalculo de gráficos sin tocar la base de datos.
 */
function poblarFiltroAccion(): void {
  selectorAccion.innerHTML = '';
  const opcionTodas = document.createElement('option');
  opcionTodas.value = 'todas';
  opcionTodas.textContent = 'Todas las acciones';
  selectorAccion.appendChild(opcionTodas);

  estadoDashboard.accionesDisponibles.forEach((accion) => {
    const opcion = document.createElement('option');
    opcion.value = accion;
    opcion.textContent = accion;
    selectorAccion.appendChild(opcion);
  });

  contenedorFiltroAccion.hidden = estadoDashboard.accionesDisponibles.length === 0;
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
 * Agrupa registros por minuto para facilitar el cálculo de promedios y conteos.
 * Retorna un mapa donde la llave es la marca de tiempo truncada al minuto en ISO.
 * Impacta en el rendimiento al permitir cálculos por lote en lugar de iterar múltiples veces.
 */
function agruparRegistrosPorMinuto(registros: RegistroNormalizado[]): Map<string, { tiemposSegundos: number[]; conteo: number }> {
  const agrupados = new Map<string, { tiemposSegundos: number[]; conteo: number }>();

  registros.forEach((registro) => {
    const marcaPorMinuto = new Date(registro.fechaEvento);
    marcaPorMinuto.setSeconds(0, 0);
    const claveMinuto = marcaPorMinuto.toISOString();

    const agrupacionExistente = agrupados.get(claveMinuto) || {
      tiemposSegundos: [],
      conteo: 0
    };

    agrupacionExistente.tiemposSegundos.push(convertirTiempoASegundos(registro.tiempo));
    agrupacionExistente.conteo += 1;

    agrupados.set(claveMinuto, agrupacionExistente);
  });

  return agrupados;
}

/**
 * Calcula las métricas necesarias para los gráficos a partir de los registros filtrados.
 * Separa claramente la obtención de datos (ya realizada) de la transformación para visualización.
 * Impacta en el rendimiento del renderer al trabajar con estructuras livianas.
 */
function calcularMetricasParaGraficos(registrosFiltrados: RegistroNormalizado[]): {
  etiquetas: Date[];
  promediosPorMinuto: number[];
  conteosPorMinuto: number[];
} {
  const agrupados = agruparRegistrosPorMinuto(registrosFiltrados);
  const etiquetas: Date[] = [];
  const promediosPorMinuto: number[] = [];
  const conteosPorMinuto: number[] = [];

  Array.from(agrupados.keys())
    .sort()
    .forEach((claveMinuto) => {
      const agrupacion = agrupados.get(claveMinuto);
      if (!agrupacion) {
        return;
      }

      const { tiemposSegundos, conteo } = agrupacion;
      const sumaTiempos = tiemposSegundos.reduce((acumulado, valor) => acumulado + valor, 0);
      const promedio = conteo > 0 ? sumaTiempos / conteo : 0;

      etiquetas.push(new Date(claveMinuto));
      promediosPorMinuto.push(promedio);
      conteosPorMinuto.push(conteo);
    });

  return { etiquetas, promediosPorMinuto, conteosPorMinuto };
}

/**
 * Renderiza o actualiza el gráfico de duración promedio por minuto.
 * Respeta la regla de eje Y con mínimo 7 y máximo dinámico según los valores presentes.
 * Impacta en la claridad visual de las métricas de rendimiento de la aplicación monitoreada.
 */
function renderizarGraficoDeDuracion(etiquetas: Date[], promediosPorMinuto: number[]): void {
  if (graficoDuracionPromedio) {
    graficoDuracionPromedio.destroy();
  }

  const maximoEnDatos = promediosPorMinuto.length > 0 ? Math.max(...promediosPorMinuto) : 0;
  const limiteSuperior = maximoEnDatos > 7 ? maximoEnDatos : 7;

  graficoDuracionPromedio = new Chart(lienzoGraficoDuracion, {
    type: 'line',
    data: {
      labels: etiquetas,
      datasets: [
        {
          label: 'Duración promedio (s)',
          data: promediosPorMinuto,
          borderColor: '#1f6feb',
          backgroundColor: 'rgba(31, 111, 235, 0.1)',
          tension: 0.2,
          pointRadius: 2
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          type: 'time',
          time: { unit: 'minute', tooltipFormat: 'yyyy-MM-dd HH:mm' },
          ticks: { color: '#374151' },
          grid: { color: '#e5e7eb' }
        },
        y: {
          min: 7,
          max: limiteSuperior,
          ticks: { color: '#374151' },
          grid: { color: '#e5e7eb' }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#111827' }
        }
      }
    }
  });
}

/**
 * Renderiza o actualiza el gráfico de conteo de transacciones por minuto.
 * Mantiene el mismo eje X que el gráfico de duración para facilitar la comparación visual.
 * Impacta en la comprensión de volumen de actividad durante el rango seleccionado.
 */
function renderizarGraficoDeConteo(etiquetas: Date[], conteosPorMinuto: number[]): void {
  if (graficoCantidadPorMinuto) {
    graficoCantidadPorMinuto.destroy();
  }

  graficoCantidadPorMinuto = new Chart(lienzoGraficoCantidad, {
    type: 'bar',
    data: {
      labels: etiquetas,
      datasets: [
        {
          label: 'Transacciones por minuto',
          data: conteosPorMinuto,
          backgroundColor: '#0d9488',
          borderRadius: 2
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          type: 'time',
          time: { unit: 'minute', tooltipFormat: 'yyyy-MM-dd HH:mm' },
          ticks: { color: '#374151' },
          grid: { color: '#e5e7eb' }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#374151' },
          grid: { color: '#e5e7eb' }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#111827' }
        }
      }
    }
  });
}

/**
 * Recalcula los gráficos aplicando el filtro de acción sin tocar la base de datos.
 * Se ejecuta tanto tras una nueva consulta como al cambiar el selector de acción.
 * Impacta en la respuesta interactiva de la UI, manteniendo la app fluida durante el post-procesamiento.
 */
function actualizarGraficosConFiltroSeleccionado(): void {
  const accionSeleccionada = selectorAccion.value;

  estadoDashboard.registrosFiltrados = estadoDashboard.registrosCrudos.filter((registro) => {
    if (accionSeleccionada === 'todas') {
      return true;
    }

    return registro.accion === accionSeleccionada;
  });

  if (estadoDashboard.registrosFiltrados.length === 0) {
    mostrarEstadoDeConsulta('No hay datos para la acción seleccionada.', 'alerta');
    contenedorGraficos.hidden = true;
    return;
  }

  const { etiquetas, promediosPorMinuto, conteosPorMinuto } = calcularMetricasParaGraficos(
    estadoDashboard.registrosFiltrados
  );

  contenedorGraficos.hidden = false;
  renderizarGraficoDeDuracion(etiquetas, promediosPorMinuto);
  renderizarGraficoDeConteo(etiquetas, conteosPorMinuto);
  mostrarEstadoDeConsulta('Resultados listos.', 'exito');
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
    mostrarEstadoDeConsulta('Indique fecha inicio y fecha fin para consultar.', 'alerta');
    return;
  }

  bloquearUIDuranteCarga(true);
  contenedorGraficos.hidden = true;
  mostrarEstadoDeConsulta('Cargando datos (puede tardar hasta 2 minutos)...', 'info');

  try {
    const respuesta = await window.electronAPI.ejecutarConsultaDeLogs({
      fechaInicioIso: new Date(fechaInicio).toISOString(),
      fechaFinIso: new Date(fechaFin).toISOString()
    });

    const registrosNormalizados = respuesta.registrosCrudos.map(normalizarRegistroCrudo);

    if (registrosNormalizados.length === 0) {
      mostrarEstadoDeConsulta('Sin datos para el rango seleccionado.', 'alerta');
      contenedorFiltroAccion.hidden = true;
      return;
    }

    estadoDashboard.registrosCrudos = registrosNormalizados;
    const accionesUnicas = Array.from(new Set<string>(registrosNormalizados.map((registro) => registro.accion))).sort();
    estadoDashboard.accionesDisponibles = accionesUnicas;

    poblarFiltroAccion();
    actualizarGraficosConFiltroSeleccionado();
  } catch (error) {
    console.error('Error durante la consulta manual:', error);
    const mensaje = error instanceof Error ? error.message : 'Error desconocido';
    mostrarEstadoDeConsulta(`Error al consultar: ${mensaje}`, 'error');
    contenedorGraficos.hidden = true;
  } finally {
    bloquearUIDuranteCarga(false);
  }
}

botonConsultar.addEventListener('click', () => {
  void manejarConsulta();
});

selectorAccion.addEventListener('change', () => {
  actualizarGraficosConFiltroSeleccionado();
});
