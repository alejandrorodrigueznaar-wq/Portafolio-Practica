# Portafolio de Práctica Profesional Supervisada (UNAH - INPREMA)

Este sitio web es un portafolio estático, moderno y accesible desarrollado en **HTML5, CSS3 y JavaScript puro**, diseñado para publicarse de forma gratuita e inmediata en **GitHub Pages**.

Todo el contenido del sitio (datos del estudiante, colaboradores y proyectos) se administra centralizadamente desde el archivo `data/trabajos.json`.

---

## 📁 Estructura del Proyecto

```text
PRACTICA UNAH - 2026/
├── index.html              # Estructura semántica principal y visor modal
├── css/
│   └── estilos.css         # Diseño visual, paleta azul institucional y responsive
├── js/
│   └── app.js              # Carga dinámica, buscador en tiempo real, filtros y visor
├── data/
│   └── trabajos.json       # Base de datos editable con tus personas y trabajos
├── documentos/             # Carpeta para colocar tus PDFs, imágenes, Excel, etc.
├── fotos/                  # Carpeta para las fotos de los colaboradores
├── logo-inprema.png        # Logotipo institucional
└── LEEME.md                # Este manual de instrucciones
```

---

## ✏️ ¿Cómo agregar o modificar contenido?

Para actualizar tu información, únicamente debes abrir y editar el archivo:
👉 `data/trabajos.json`

### 1. Datos generales del estudiante y la práctica

Al inicio del JSON encontrarás el bloque `"estudiante"`. Puedes modificar tu nombre, título y la descripción:

```json
"estudiante": {
  "nombre": "Nahum",
  "titulo": "Portafolio de Práctica Profesional",
  "carrera": "Práctica Profesional Supervisada • UNAH",
  "universidad": "Universidad Nacional Autónoma de Honduras (UNAH)",
  "institucion": "Instituto Nacional de Previsión del Magisterio (INPREMA)",
  "periodo": "2026",
  "presentacion": "Tu descripción o resumen de la práctica aquí..."
}
```

### 2. Agregar una nueva persona colaboradora

En el arreglo `"personas"`, agrega un nuevo objeto con un `id` único (en minúsculas y sin espacios):

```json
{
  "id": "nueva-persona",
  "nombre": "Lic. María Pérez",
  "cargo": "Jefa del Área Actuarial",
  "area": "Departamento de Actuaría y Finanzas",
  "foto": "fotos/maria-perez.jpg"
}
```

> **Nota sobre las fotos:** Si dejas `"foto": ""` (vacío) o el archivo de imagen no existe, el sistema generará automáticamente un círculo elegante con las iniciales de la persona.

### 3. Agregar un nuevo trabajo o entregable

En el arreglo `"trabajos"`, añade un nuevo objeto. Ten en cuenta que **un trabajo puede estar asociado a una o más personas**:

```json
{
  "id": "t6",
  "titulo": "Auditoría de Procesos de Ventanilla Única",
  "tipo": "Informe",
  "fecha": "2026-10",
  "resumen": "Resumen claro de 2 a 3 líneas explicando el propósito y resultado del trabajo realizado.",
  "archivo": "documentos/auditoria-ventanilla.pdf",
  "personas": ["kevin-espinoza", "nueva-persona"]
}
```

#### Tipos de documentos admitidos:
* `Informe` (muestra previsualización de PDF en el visor)
* `Presentación` (admite PDF o diapositivas)
* `Diagrama` (admite imágenes JPG, PNG o PDF)
* `Hoja de cálculo` (muestra ficha y botón directo de descarga)
* `Otro`

---

## 🚀 Cómo publicar tu portafolio en GitHub Pages

GitHub Pages te permite publicar este sitio web gratis en menos de 3 minutos:

### Opción 1: Directamente desde el navegador (sin comandos)
1. Inicia sesión en tu cuenta de [GitHub](https://github.com).
2. Haz clic en **New repository** (Nuevo repositorio).
3. Nómbralo, por ejemplo: `portafolio-practica-unah` y déjalo como **Public**.
4. Haz clic en **Create repository**.
5. En la pantalla que aparece, haz clic en el enlace **"uploading an existing file"** (subir archivos existentes).
6. Arrastra los archivos y carpetas del portafolio (`index.html`, `css/`, `js/`, `data/`, `documentos/`, `fotos/`, etc.).
7. Haz clic en **Commit changes**.
8. Ve a la pestaña **Settings** (Configuración) del repositorio.
9. En el menú lateral izquierdo, haz clic en **Pages**.
10. En **Branch**, selecciona `main` y la carpeta `/(root)`.
11. Haz clic en **Save**. En un par de minutos tendrás tu enlace web público listo para compartir (ej. `https://tuusuario.github.io/portafolio-practica-unah/`).

### Opción 2: Usando Git en tu computadora
Abre la terminal en esta carpeta y ejecuta:
```bash
git init
git add .
git commit -m "Publicación inicial del portafolio de práctica profesional"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```
Luego activa GitHub Pages en **Settings > Pages > Branch: main**.

---

## 💻 Vista previa en tu computadora

* **Método directo:** Puedes abrir el archivo `index.html` en cualquier navegador web moderno (Brave, Chrome, Edge, Firefox).
* **Con servidor local:** Si deseas probar la carga directa del JSON mediante HTTP local, puedes abrir una terminal en esta carpeta y ejecutar:
  ```powershell
  python -m http.server 8000
  ```
  Y abrir en tu navegador: `http://localhost:8000`
