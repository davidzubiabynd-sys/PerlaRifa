# Despliegue de PerlaRifa

## Supabase

1. Usa un proyecto independiente de PerlaRifa. Habilita Data API y RLS; no expongas automáticamente tablas nuevas.
2. Ejecuta las migraciones de `supabase/migrations` en orden. La última reemplaza las políticas públicas heredadas y crea `raffle_admins`, permisos por propietario y una función pública que devuelve únicamente números ocupados.
3. En Authentication → Providers, habilita **Anonymous sign-ins**. Los participantes no necesitan contraseña, pero cada navegador mantiene una sesión privada. Verificar y subir comprobantes debe hacerse desde el mismo navegador donde se apartó. Si se perdió la sesión, contactar a Perla por WhatsApp.
4. Crea el usuario administrativo en Authentication → Users con un correo y una contraseña elegida por su propietario. No guardes esa contraseña en el código ni en variables `VITE_`.
5. Tras confirmar el usuario que debe recibir acceso, registra su UUID en `public.raffle_admins`. Nunca habilites inserciones públicas en esta tabla. Desactiva registros con correo públicos si no son necesarios; los participantes usan la sesión anónima.
6. Obtén Project URL y la clave publicable/anon. No se necesita la clave secreta ni service role para esta aplicación.

## Vercel

El proyecto usa el preset `vercel` de Nitro y genera `.vercel/output`.

- Importar el repositorio `davidzubiabynd-sys/PerlaRifa`.
- Framework: Other. Node: 22.x o una versión compatible con Vite 8.
- Install: `npm ci`. Build: `npm run build`. Output: `.vercel/output`.
- Variables Production y Preview: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
- No configurar `VITE_DEMO_ADMIN_PASSWORD` ni `SUPABASE_SERVICE_ROLE_KEY`.
- Configurar el dominio publicado como Site URL en Supabase.

## Verificación

Probar apartados ficticios y comprobantes de prueba, comprobar disponibilidad desde otro navegador y confirmar que no puede consultar datos de otros participantes. Entrar al admin con la cuenta autorizada y verificar sus apartados. Las operaciones de pagos y el sorteo real deben realizarlas las personas responsables de la rifa.

La seguridad SQL se validó localmente con PostgreSQL en memoria: lectura por propietario, administración exclusiva, comprobantes privados, bloqueos de privilegios, rango/duplicados y conflictos al reactivar boletos vencidos. El despliegue debe comprobarse también contra la base de Supabase configurada.
