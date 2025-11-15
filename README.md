# Planning Your Week

> Simple weekly planner (React + Vite + TypeScript + Tailwind). Guarda el estado en localStorage por defecto. Opcionalmente preparado para integrarse con Firebase (Auth + Firestore) para datos por usuario.

## Estructura principal

- `frontend/` - aplicación React (Vite + TypeScript + Tailwind)
- `APIs_course/` - otro proyecto en el mismo workspace (no parte del frontend)

---

## Requisitos

- Node.js 18+ y npm
- PowerShell (Windows) o tu terminal preferido

## Desarrollo (frontend)

1. Abrir terminal en `frontend`:

```powershell
cd "C:\Users\Marcos Avila\Desktop\Planning_your_week\frontend"
npm install
npm run dev
```

2. Abrir `http://localhost:5173` en el navegador.

## Construir para producción

```powershell
cd "C:\Users\Marcos Avila\Desktop\Planning_your_week\frontend"
npm run build
# El resultado queda en `dist/` (o en la carpeta configurada en `vite.config.ts`).
```

## Despliegue en Render.com (frontend estático)

Configuración mínima en Render:

- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- Añade variables de entorno en Render si activas Firebase (VER ABAJO)

Nota: si no añades backend ni Firestore, la aplicación usará `localStorage` y cada usuario tendrá datos independientes en su navegador.

## Persistencia de datos

Por defecto la aplicación guarda los datos en `localStorage` del navegador, por lo que cada usuario tiene su propia información en su dispositivo. Si quieres sincronizar datos entre dispositivos o usuarios, es necesario añadir un servicio central (por ejemplo, un backend con base de datos o un servicio gestionado tipo Firestore) y un sistema de autenticación.

## Exportar a PDF

La aplicación incluye una función para generar y descargar un PDF (usa `html2pdf.js`).

- En la UI: botón `📥 Descargar PDF` descarga el horario en formato `horario-YYYY-MM-DD.pdf`.

Prueba rápida:

1. Asigna algunas horas en el planner.
2. Clic en `📥 Descargar PDF`.
3. Verifica que el PDF contiene todo el horario en orientación horizontal.

## Git / Buenas prácticas antes de desplegar

- Asegúrate de tener `.gitignore` (ya existe en `frontend/.gitignore` y en la raíz).
- Commit y push antes de crear el servicio en Render.

Ejemplo de comandos:

```powershell
cd "C:\Users\Marcos Avila\Desktop\Planning_your_week\frontend"
git add .
git commit -m "Prepare frontend for deploy"
git push origin main
```

## Re-activar Firebase en la aplicación

Ficheros clave:

- `src/firebase.ts` — configuración de Firebase.
- `src/components/Login.tsx` — pantalla de login (ya creada, integrable).
- `src/store.ts` — lógica de persistencia (se puede extender para sincronizar con Firestore).

Para soporte multi-usuario en la nube: habilita Firebase y adapta `src/store.ts` para leer/escribir por `uid`.

## Soporte / Cambios futuros

- Puedo ayudarte a integrar Firebase Auth + Firestore para que cada usuario tenga datos sincronizados.
- También puedo crear un backend (Express/Flask) si prefieres no usar Firebase.

---

Si quieres que prepare el despliegue en Render ya mismo (configurar `render.yaml` o crear el servicio), dime y lo preparo.
