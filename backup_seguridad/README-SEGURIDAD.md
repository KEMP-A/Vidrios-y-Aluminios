# Auditoría y medidas de seguridad — Vidrios y Más

## Qué se implementó en el código (ya activo)

1. **Anti-XSS**
   - Se eliminaron todos los manejadores en línea (`onclick`, `onsubmit`) y se reemplazaron por `addEventListener`.
   - No se usa `innerHTML` en ningún punto.
   - CSP con `script-src 'self'` bloquea scripts inyectados.

2. **Formulario de contacto**
   - Sanitización de nombre, teléfono, correo y mensaje (`limpiar()`).
   - Validación estricta de correo, teléfono, tipo de proyecto y longitudes (nombre 2+, mensaje 10–1000 caracteres).
   - Honeypot anti-spam (`fEmpresa`).
   - Rate limiting en el cliente: máximo 1 envío cada 60 s.
   - Mensajes de error generales (no revelan detalles técnicos).
   - ⚠️ Esto NO reemplaza la validación en el servidor. Cuando agregues backend, debes validar y sanitizar también ahí, con rate limiting real y protección contra bots (p. ej. reCAPTCHA/Turnstile).

3. **Enlaces externos**
   - Todos los `target="_blank"` ahora incluyen `rel="noopener noreferrer"`.

4. **Headers de seguridad**
   - La página incluye CSP, X-Content-Type-Options y Referrer-Policy vía `<meta>`.
   - Para HSTS, Permissions-Policy y X-Frame-Options reales, copia el archivo correspondiente a tu hosting desde esta carpeta:
     - Apache: `seguridad/.htaccess`
     - Netlify: `seguridad/_headers`
     - Vercel: `seguridad/vercel.json`

5. **Secretos y archivos**
   - `.gitignore` en la raíz protege `.env`, claves, backups, logs y dependencias.
   - No hay claves API, contraseñas ni tokens en el código. Si alguna vez subes una por error, debes REVOCARLA y reemplazarla (no basta con ocultarla).

## Lo que AÚN debes configurar (depende de ti / del hosting)

- **HTTPS**: actívalo en tu dominio/hosting (Netlify/Vercel lo dan automático; en Apache usa Let's Encrypt). La redirección HTTP→HTTPS está en el `.htaccess`.
- **CSP/HSTS reales por servidor**: los `<meta>` ayudan, pero HSTS y X-Frame-Options solo funcionan bien como headers HTTP → aplica el archivo de tu plataforma.
- **Backend del formulario**: falta crear endpoint seguro (validación servidor, sanitización, rate limiting por IP, protección anti-bots, envío por servicio de correo). Nunca ejecutes ni redirijas datos sin validar.
- **Subida de imágenes (futuro)**: validar tipo real (magic bytes), limitar tamaño (p. ej. 5 MB), permitir solo jpg/png/webp, renombrar archivos, guardar fuera del directorio ejecutable y nunca servirlos como PHP/JS.
- **Base de datos (si se agrega)**: consultas parametrizadas, hashing de contraseñas (bcrypt/argon2), principio de mínimo privilegio, credenciales solo en variables de entorno.
- **Panel admin (si se agrega)**: sesiones con cookies HttpOnly + Secure + SameSite, expiración, rate limiting en login, protección fuerza bruta.
- **Privacidad (Colombia, Ley 1581)**: no publiques datos de clientes, no registres datos personales en logs, define política de tratamiento de datos y consentimiento en el formulario.
- **CSP endurecida**: ya no se usa `'unsafe-inline'` en `style-src` (todos los estilos inline se movieron a `css/estilo.css`) y se eliminó `images.unsplash.com` de `img-src`. La CSP final solo permite: `script-src 'self'`, `style-src 'self' https://fonts.googleapis.com`, `font-src 'self' https://fonts.gstatic.com`, `img-src 'self' data:`, `connect-src 'self'`, `object-src 'none'`, `frame-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`.
- **Imágenes**: todas las fotos de demostración externas se retiraron. Las rutas locales están listas en `assets/images/` (hoy con fondo placeholder gris hasta incorporar las fotos reales). Alojar las fotos reales en `assets/images/` evita dependencias externas.
- **Estructura**: `index.html`, `css/estilo.css`, `js/main.js`, `assets/images/`, `assets/icons/`, `seguridad/`.

## Riesgos restantes conocidos

- Las dependencias externas restantes son solo **Google Fonts** (tipografía); no hay imágenes, scripts ni APIs externas.
- El rate limiting del formulario en el cliente lo puede saltar un atacante; la protección real debe ir en el servidor.
- Las fotos placeholder del formulario quedarán rotas (rutas `assets/images/*.jpg`) hasta que incorpores las imágenes reales. No afecta a la CSP ni a las funciones.
