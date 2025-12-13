# Monitoreo MEL

Aplicación de escritorio multiplataforma construida con Electron para monitorear logs almacenados en PostgreSQL. El enfoque prioriza legibilidad, trazabilidad y estabilidad por encima de optimizaciones tempranas.

## Requerimientos
- Node.js 18+
- PostgreSQL accesible con las credenciales expuestas en variables de entorno

## Configuración de entorno
Definir variables de entorno antes de ejecutar la aplicación:

- `POSTGRES_HOST` (por defecto `localhost`)
- `POSTGRES_PORT` (por defecto `5432`)
- `POSTGRES_USER` (por defecto `postgres`)
- `POSTGRES_PASSWORD` (por defecto `postgres`)
- `POSTGRES_DATABASE` (por defecto `monitoreo`)

La tabla esperada se llama `logs` y debe contener las columnas:

- `fecha_evento` (timestamp)
- `accion` (texto)
- `tiempo` (duración en milisegundos)

## Instalación
```bash
npm install
```

## Ejecución
```bash
npm start
```

## Flujo de uso
1. Ingrese fecha inicio y fecha fin y presione **Consultar**.
2. Espere a que se carguen los datos (hasta 2 minutos para grandes volúmenes).
3. Ajuste el **Filtro Acción** para recalcular los gráficos sin reconsultar la base.

## Gráficos incluidos
- **Duración promedio por minuto**: escala Y mínima 7, máxima dinámica según los datos.
- **Cantidad de transacciones por minuto**: comparte el eje X por minuto.

Los datos se consultan vía SQL directo y se procesan en el renderer por bloques para mantener el consumo de memoria controlado.
