# Planning Your Week — Frontend

> Aplicación web para planificar tu semana (7 días × 24 horas). Interfaz ligera con arrastrar para asignar horas, soporte de tipos de hora (colores), exportación a PDF y persistencia local.

## Características principales

- Interfaz de 7 días × 24 horas con selección por clic o arrastre (horizontal/vertical).
- Gestión de tipos de hora (crear, seleccionar, bloquear).
- Persistencia local en `localStorage` por defecto (datos por navegador).
- Exportar el horario como PDF (`📥 Descargar PDF`).

## Tecnologías

- React 18 + Vite
- TypeScript
- Tailwind CSS
- html2pdf.js (exportar PDF)

## Desarrollo

1. Abrir terminal en la carpeta `frontend`:

```powershell
cd "C:\Users\Marcos Avila\Desktop\Planning_your_week\frontend"
npm install
npm run dev
```

2. Abrir `http://localhost:5173`.

## Build (producción)

```powershell
cd "C:\Users\Marcos Avila\Desktop\Planning_your_week\frontend"
npm run build
# El artefacto queda en `dist/` por defecto
```

## Despliegue en Render.com

- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- Opcional: añade variables de entorno en Render si vas a activar Firebase (aunque la configuración del cliente está en `src/firebase.ts`).

Notas:
- Si no habilitas Firebase o un backend, la app usa `localStorage` y cada usuario tendrá sus datos locales en su navegador.

> Nota: la integración con Firebase se ha eliminado de este repositorio. La aplicación guarda los datos en `localStorage` por defecto.

## Exportar a PDF

El botón `📥 Descargar PDF` genera un PDF en orientación horizontal (A4 landscape) que descarga directamente el archivo `horario-YYYY-MM-DD.pdf`.

## Estructura de carpetas (relevante)

- `src/` — código fuente React
- `src/components/` — componentes UI (Header, Planner, Login, etc.)
- `src/utils/exportPdf.ts` — utilidad para exportar a PDF
- (No hay configuración de Firebase en este repositorio)

## Buenas prácticas antes de desplegar

- Confirma que `.gitignore` está presente (ignora `node_modules`, `dist`, `.env*`).
- Hacer commit y push del branch que quieras desplegar.

## Soporte

Si quieres que integre Firestore para que cada usuario tenga datos centralizados o que cree un backend en Render, dime y lo preparo.
# Frontend (React + Vite + TypeScript + Tailwind)

This folder contains a minimal Vite React + TypeScript app styled with Tailwind CSS. It provides a Planner UI that visually matches the attached screenshot.

How to run

1. Open a terminal in this folder:

   cd "c:\Users\Marcos Avila\Desktop\Planning_your_week\frontend"

2. Install dependencies (npm):

   npm install

3. Start development server:

   npm run dev

Notes

- I intentionally scaffolded a minimal app and used Tailwind classes to match the look.
- If you want to integrate shadcn/ui components (recommended for consistent UI primitives), run:

  npx shadcn@latest init

  then follow the prompts to add components. The project is already set up to use Tailwind.

If you want, I can:
- add a React Router + pages setup
- wire this frontend to your existing Express app (serve built files or proxy during dev)
- run npm install and start the dev server here (if you want me to try running commands locally now)
