# Rifa de Perla Madrigal

Rifa de una tablet Acer A11 como la imagen de referencia, con **200 boletos numerados del 001 al 200**. No se han confirmado las especificaciones exactas del equipo.

Incluye selección de boletos, apartados, verificador con comprobantes, panel administrativo en `/admin-rifa`, sorteo de la tablet y flyers descargables de invitación y ganador. Los premios instantáneos de la plantilla permanecen desactivados porque no se han confirmado premios adicionales.

## Datos pendientes

- Precio de cada boleto en MXN.
- Fecha y hora del sorteo, zona horaria y cierre de ventas.
- Teléfono/WhatsApp e Instagram de contacto.
- Banco, titular y CLABE/cuenta para pagos.
- Enlace público donde se desplegará la rifa.
- Confirmación del modelo Acer A11, capacidad y condiciones de entrega de la tablet.
- Motivo de la rifa y reglas: cómo se elige al ganador y qué ocurre si no se venden todos los boletos.
- Proyecto independiente de Supabase y acceso administrativo seguro.

El precio permanece vacío y los apartados se habilitan al confirmarlo. La fecha no muestra una cuenta regresiva ficticia. No hay cuentas bancarias ni destinos de contacto de ejemplo activos.

## Configuración

Los datos principales están en `src/lib/raffle.ts`. Los pagos se configuran en `src/lib/banks.ts`. La imagen proporcionada está en `public/tablet-acer-a11.png`.

Copia `.env.example` a `.env`, configura un proyecto NUEVO de Supabase y aplica las migraciones en orden. La última restringe la numeración a 001–200 y rechaza duplicados. No reutilices la base de la rifa original. Nunca publiques `.env` ni claves de servicio.

Instala con `bun install` y ejecuta `bun run dev`; para compilar usa `bun run build`. También puede usarse npm. Para publicar debes configurar el hosting y las variables de entorno del proyecto.

## Administración

El código exportado de Lovable incluye administración de apartados, comprobantes, estados de pago, notas, liberación de boletos, búsqueda y panel de sorteos. Esta copia conserva esas funciones y ajusta el sorteo a una sola tablet y 200 boletos. Los flyers del ganador se completan con el resultado confirmado, no con nombres precargados.

Antes de recibir datos reales, sustituye el control administrativo en navegador por autenticación en servidor y configura políticas RLS que protejan nombres, teléfonos y comprobantes. Las políticas públicas heredadas de la plantilla y `VITE_DEMO_ADMIN_PASSWORD` no son protección suficiente para producción. La clave `SUPABASE_SERVICE_ROLE_KEY` debe permanecer únicamente en el servidor.

Crear este repositorio desde la plantilla no lo conecta automáticamente a Lovable, Supabase ni a un sitio publicado.
