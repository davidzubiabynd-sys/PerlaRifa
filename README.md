# Plantilla de rifas

Base React + TanStack Start + Supabase, preparada a partir del proyecto de Lovable. Incluye selección de boletos, apartados, comprobantes, panel administrativo, sorteos y flyers.

## Crear una rifa nueva

1. En GitHub pulsa **Use this template → Create a new repository**. Cada rifa debe tener su propio repositorio.
2. Crea un proyecto nuevo de Supabase. No reutilices la base de otra rifa: mezclarías participantes, pagos y boletos.
3. Copia `.env.example` a `.env` y configura las variables de tu proyecto. Nunca subas `.env` ni claves de servicio.
4. Aplica las migraciones de `supabase/migrations` en orden a esa base nueva.
5. Personaliza los archivos indicados abajo y añade tus imágenes en `public/`.
6. Instala las dependencias con Bun (`bun install`) y ejecuta `bun run dev`. Para compilar: `bun run build`.

## Dónde personalizar

| Contenido | Archivo |
| --- | --- |
| Persona, causa, premios, fecha, cantidad de boletos y precio | `src/routes/index.tsx` |
| Banco, titular, CLABE y contacto de pagos | `src/lib/banks.ts` |
| Fotos y logos | `public/` y las URL en `src/assets/*.asset.json` |
| Premios instantáneos y patrocinadores | `src/lib/goldenTickets.ts` y `src/routes/index.tsx` |
| Flyers, premios y enlaces impresos | `src/components/Flyers.tsx` |
| Premios del sorteo | `src/components/DrawPanel.tsx` |
| Tarjeta para compartir | `src/components/SupporterBadge.tsx` |
| Título y metadatos para redes | `src/routes/__root.tsx` |
| Verificador y panel administrativo | `src/routes/verificador.tsx`, `src/routes/admin-rifa.tsx` |

Los premios y las fechas conservados son ejemplos. Algunos precios y premios se repiten en flyers, verificador y panel administrativo: actualízalos de manera consistente antes de publicar. Los teléfonos y cuentas con ceros son marcadores que debes reemplazar.

## Limpieza realizada

Se retiraron la configuración real de Supabase, contraseña administrativa original, teléfono, cuenta bancaria, identidad e historia médica, imágenes y enlaces del proyecto original y destino del webhook. No se incluyen registros de participantes, pagos ni comprobantes: el archivo exportado contiene código y esquema, no la base de datos.

Las imágenes de Lovable solo venían como referencias a su almacenamiento; se sustituyeron por un SVG local de ejemplo para que la plantilla sea independiente.

## Antes de aceptar datos reales

El proyecto original permite operaciones públicas sobre `reservations` en sus políticas de Supabase, y su acceso administrativo se valida en el navegador. Esa contraseña NO protege la base de datos. Esta plantilla es una base de desarrollo: implementa autenticación administrativa en servidor, autorización mediante RLS y endpoints públicos limitados antes de usar nombres, teléfonos o comprobantes reales. `VITE_DEMO_ADMIN_PASSWORD` solo sirve para pruebas y está vacío por defecto.

Configura los webhooks únicamente con destinos propios autorizados; vacíos no envían datos. Mantén `SUPABASE_SERVICE_ROLE_KEY` exclusivamente en el servidor.

## Lovable

Crear un repositorio desde esta plantilla copia archivos, no la base de datos ni la conexión del proyecto original de Lovable. Cada instancia necesita su propia configuración y despliegue. El ZIP entregado se descomprime antes de subir: GitHub no descomprime archivos ZIP dentro de un repositorio.
