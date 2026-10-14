# Rifa de Perla Madrigal

Rifa de una tablet Acer Iconia Tab A11 como la imagen de referencia, con **200 boletos numerados del 001 al 200**. Cada boleto cuesta **$100 MXN**. Se anunciará al ganador en cuanto se vendan los 200 boletos. El motivo es apoyar los gastos hospitalarios de Perla Madrigal.

Incluye selección de boletos, apartados, verificador con comprobantes, panel administrativo en `/admin-rifa`, sorteo de la tablet y flyers descargables de invitación y ganador. No hay boletos de oro ni premios instantáneos; el único premio es la tablet.

## Datos pendientes

- Instagram de contacto, si se desea incluir.
- Enlace público donde se desplegará la rifa.
- Capacidad y condiciones de entrega de la tablet.
- Reglas del sorteo: método para elegir al ganador y qué ocurre si no se completan las ventas.
- Proyecto independiente de Supabase y acceso administrativo seguro.

## Contacto y pago

WhatsApp: **662 290 5054**. Enlace: https://wa.me/5216622905054.

Banco: **BANCOPPEL**. Titular: **Perla Madrigal**. Tarjeta: **4169 1606 2587 5035**. El número se muestra como tarjeta, no como CLABE. Si no puedes transferir, usa el botón de WhatsApp para solicitar ayuda.

Los apartados en línea requieren conectar la nueva base de datos. No hay una fecha fija ni una cuenta regresiva: el anuncio del ganador está condicionado a vender los 200 boletos.

## Configuración

Los datos principales están en `src/lib/raffle.ts`. Los pagos se configuran en `src/lib/banks.ts`. La imagen proporcionada está en `public/tablet-acer-a11.png`.

Copia `.env.example` a `.env`, configura un proyecto NUEVO de Supabase y aplica las migraciones en orden. La última restringe la numeración a 001–200 y rechaza duplicados. No reutilices la base de la rifa original. Nunca publiques `.env` ni claves de servicio.

Instala con `bun install` y ejecuta `bun run dev`; para compilar usa `bun run build`. También puede usarse npm. Para publicar debes configurar el hosting y las variables de entorno del proyecto.

## Administración

El código exportado de Lovable incluye administración de apartados, comprobantes, estados de pago, notas, liberación de boletos, búsqueda y panel de sorteos. Esta copia conserva esas funciones y ajusta el sorteo a una sola tablet y 200 boletos. Los flyers del ganador se completan con el resultado confirmado, no con nombres precargados.

Antes de recibir datos reales, sustituye el control administrativo en navegador por autenticación en servidor y configura políticas RLS que protejan nombres, teléfonos y comprobantes. Las políticas públicas heredadas de la plantilla y `VITE_DEMO_ADMIN_PASSWORD` no son protección suficiente para producción. La clave `SUPABASE_SERVICE_ROLE_KEY` debe permanecer únicamente en el servidor.

Crear este repositorio desde la plantilla no lo conecta automáticamente a Lovable, Supabase ni a un sitio publicado.
