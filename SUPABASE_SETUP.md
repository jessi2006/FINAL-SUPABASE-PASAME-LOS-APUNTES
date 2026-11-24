# Configuración de Supabase Cloud · Pásame los apuntes

Proyecto existente identificado por el usuario en Supabase Cloud. La aplicación adjunta era JavaScript de navegador. Se añadió Vite como servidor de desarrollo y empaquetador, y el SDK de Supabase para JavaScript como cliente.

| Elemento | Estado |
|---|---|
| Entorno | Windows x64, Node.js 24.19.0, npm 11.17.0 |
| CLI | Declarada como dependencia de desarrollo. Instalación y versión pendientes: el registro npm devolvió `ENOTFOUND` |
| Autenticación CLI y vinculación | Pendientes de instalación y autorización en navegador |
| SDK | Declarado y utilizado en el código. Instalación pendiente por el mismo error |
| Variables | `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`. Se configuraron los valores aportados en una copia local y la distribución incluye solo un ejemplo sin valores |
| Compilación | Pendiente de instalación de Vite |
| Base remota | Migración local preparada. Aplicación y verificación pendientes |

## Archivos

- `package.json` declara Vite, el SDK y la CLI.
- `supabase-client.js` inicializa el cliente con variables del frontend.
- `index.html`, `script.js` y `styles.css` incorporan cuenta, sesión y CRUD de apuntes manteniendo el diseño general.
- `.env.example` y `.gitignore` documentan las variables y excluyen configuración local.
- `supabase/migrations/20261124000000_catalogo_apuntes.sql` prepara el catálogo, apuntes, PDFs, RPC y políticas RLS.

## Pasos para verificar el entorno

Abre una terminal en la carpeta extraída. Usa los valores de **Connect** para completar tu copia local de `.env.example` con nombre `.env.local`. Utiliza el prefijo `VITE_` porque el proyecto usa Vite.

```powershell
npm.cmd install
npx.cmd supabase --version
npx.cmd supabase login
npx.cmd supabase projects list
npx.cmd supabase init
npx.cmd supabase link --project-ref kcarzsoqedqaoyfsjrir
npx.cmd supabase migration list --linked
npx.cmd supabase db push --dry-run --linked
```

Ejecuta `init` únicamente si la carpeta todavía carece de `supabase/config.toml`. Revisa el destino vinculado y el historial antes de aplicar. Si existen tablas de otro uso con los mismos nombres, revisa el esquema y adapta la migración antes de continuar.

```powershell
npx.cmd supabase db push --linked
npx.cmd supabase migration list --linked
npm.cmd run check
npm.cmd run build
npm.cmd run dev
```

Si la CLI pide una contraseña de base de datos, introdúcela en el aviso local. En **Authentication → URL Configuration**, pon la URL real de la aplicación y registra como redirección el origen de desarrollo si vas a probar confirmación por correo.

Los registros de inicio de sesión, registro y cierre se consultan en **Auth Audit Logs** de Supabase. Las cuentas de prueba aparecen en **Authentication → Users**. Usa dos cuentas ficticias para verificar el aislamiento siguiendo el checklist.

[Instalación oficial de la CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) · [Eventos de auditoría de Auth](https://supabase.com/docs/guides/auth/audit-logs)
