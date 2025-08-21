# PROMPT para generar una app React (Vite) que crea una **postal épica** con IA (imagen + nombre + 2–3 líneas), y botón de WhatsApp (wa.me)

## Rol del modelo
Eres un/a **Senior Full‑Stack Engineer** especializado/a en **React 18 + Vite**, TypeScript, TailwindCSS, accesibilidad web e integración con **APIs de generación de imágenes y texto**. Vas a **entregar un repositorio completo** listo para ejecutar que cumpla los requisitos funcionales y técnicos de este documento.

---

## Objetivo del producto
Construir una **aplicación web (SPA)** donde la persona:
1) escribe su **nombre**, 2) elige su **profesión**, 3) **captura o sube su foto**, y 4) genera con IA una **postal épica** que muestra:
- **Imagen** del usuario transformado/a en versión **superhéroe** acorde a su profesión (manteniendo el **rostro idéntico** a la foto cargada).
- **Nombre** de la persona.
- **2–3 líneas** de **texto motivacional** resaltando su labor en la empresa (en español).

La app **debe incluir** un **botón de WhatsApp (wa.me)** para **compartir el resultado** (texto + enlace a la imagen). 

Entrega final visible en UI: **Postal (imagen + nombre + 2–3 líneas)** y botones: **Generar de nuevo**, **Descargar JSON**, **Compartir por WhatsApp**.

---

## Stack y tooling requeridos
- **Frontend**: React 18 + **Vite**, **TypeScript**, **TailwindCSS**.
- **Componentes**: shadcn/ui (Button, Card, Input, Select, Textarea, Alert), react-hook-form + zod, react-query/tanstack-query, react-webcam, react-easy-crop (o similar), clsx.
- **Estado/IO**: TanStack Query para manejo de llamadas a la API de generación (loading, error, reintentos). 
- **Formateo**: ESLint + Prettier. 
- **Tests**: Vitest + Testing Library (tests al menos para el *prompt builder* y el adaptador de API).

---

## Flujo de usuario (3 pasos)
1. **Datos**: Campo *Nombre* (string), *Profesión* (select con opciones base y "Personalizada"), checkbox de **consentimiento** para procesar foto mediante IA.
2. **Foto**: Botones "Usar cámara" (getUserMedia) y "Subir imagen" (PNG/JPG). Vista previa + **recorte** (1:1). Compresión a máx. 1024×1024 y ≤ 2 MB.
3. **Generar**: Botón "Crear mi retrato épico" → llamada a la API → mostrar progreso/skeleton → **Postal** con: 
   - **Imagen** generada (1024×1024, alt adecuado).  
   - **Nombre** (heading).  
   - **2–3 líneas** en español destacando su aporte en la empresa (*tone: épico, inclusivo, motivacional*).  
   - Botones: **Generar de nuevo**, **Descargar JSON**, **Compartir por WhatsApp**.

---

## Requisitos funcionales detallados
- **Profesiones base**: Ingenier@, Abogad@, Médic@, Diseñador/a, Docente, Chef, Arquitect@, Emprendedor/a, Músic@. Opción **Personalizada** (campo libre). 
- **Mapeo profesión → estética heroica/escenario** (usar en prompt de imagen):
  - **Ingenier@** → exoesqueleto tecnológico, hologramas de circuitos, skyline futurista nocturno, iluminación dramática.
  - **Abogad@** → capa elegante, balanza de la justicia luminosa, juzgado monumental, columnas clásicas.
  - **Médic@** → armadura sanitaria luminosa, nanobots de luz, hospital de vanguardia de fondo.
  - **Docente** → toga de sabio, constelaciones de fórmulas, biblioteca infinita resplandeciente.
  - **Chef** → chaqueta épica, torbellino de especias, cocina palaciega ardiente.
  - **Arquitect@** → planos flotantes, rascacielos en construcción, luz cenital cinematográfica.
  - **Diseñador/a** → pinceladas de luz, tipografías flotantes, estudio creativo futurista.
  - **Emprendedor/a** → gráficos ascendentes holográficos, ciudad brillante, energía dinámica.
  - **Músic@** → ondas sonoras visibles, escenario gigantesco, focos teatrales.
  - **Personalizada** → deducir atributos épicos coherentes con las palabras clave.
- **Conservación de identidad**: usar *image‑to‑image* con fuerza baja (denoising 0.25–0.35 o equivalente) para **no deformar el rostro**. Incluir *negative prompt* de calidad.
- **Descripción (2–3 líneas)**: 25–60 palabras, mencionar **nombre** y **profesión**, resaltar **impacto en la empresa** y la idea de "esa profesión vale". En **español**, sin emojis, sin comillas.
- **Exportación JSON** (descarga): 
  ```json
  {
    "name": "<string>",
    "profession": "<string>",
    "description": "<string>",
    "imageUrl": "<https or data:image/...>",
    "createdAt": "<ISO8601>"
  }
  ```
- **Compartir por WhatsApp (wa.me)**: crear un **botón** que abra `https://wa.me/` con un **mensaje prearmado** que incluya: 
  - Nombre, profesión y **breve copy** (las 2–3 líneas, compactadas). 
  - **URL de la imagen** (si es data URI, primero subir a un endpoint estático o usar objeto/URL pública devuelta por la API; WhatsApp no acepta adjuntos vía `wa.me`, solo texto con enlaces). 
  - **Plantilla** (JS):
    ```ts
    const msg = [
      `Mira mi postal épica ✨`,
      `Nombre: ${name}`,
      `Profesión: ${profession}`,
      description, // en una o dos líneas
      imageUrl // debe ser URL accesible
    ].join("\n\n");

    const wa = `https://wa.me/?text=${encodeURIComponent(msg)}`; 
    // abrir en nueva pestaña/ventana
    window.open(wa, "_blank", "noopener,noreferrer");
    ```

---

## Diseño de la **Postal** (UI)
- **Formato tarjeta/postal** (Card) estilo *poster* vertical (p.ej. 4:5 o cuadrado) con **borde redondeado 2xl**, sombra suave, padding amplio.
- **Composición**: Imagen heroica arriba (full‑bleed con border‑radius), debajo **Nombre** (tipografía display), y **2–3 líneas** en texto mediano/alto contraste. 
- **Acciones**: fila de botones (CTA primario: *Compartir por WhatsApp*; secundarios: *Generar de nuevo*, *Descargar JSON*).
- **Tema**: claro/oscuro con Tailwind; respetar accesibilidad (contraste AA mínimo, focus-visible, aria‑labels).

---

## Estructura del proyecto (obligatoria)
```
root/
├─ README.md
├─ PROMPTS.md                # (este documento, copiar contenido)
├─ .env.example
├─ index.html
├─ vite.config.ts
├─ tsconfig.json
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ styles/tailwind.css
│  ├─ components/
│  │  ├─ FormStep.tsx
│  │  ├─ CameraCapture.tsx
│  │  ├─ ImageCropper.tsx
│  │  ├─ ResultPostcard.tsx  # tarjeta/postal
│  │  └─ ShareWhatsAppButton.tsx
│  ├─ lib/
│  │  ├─ generation.ts       # interfaz común
│  │  ├─ promptBuilder.ts    # construye prompts imagen/texto
│  │  ├─ openaiAdapter.ts    # implementación estilo OpenAI (image-to-image + texto)
│  │  └─ stabilityAdapter.ts # implementación estilo Stability (o stubs)
│  ├─ hooks/
│  │  └─ useGenerateEpic.ts
│  ├─ utils/
│  │  └─ image.ts            # compresión, validaciones
│  └─ types/
│     └─ index.ts
└─ tests/
   ├─ promptBuilder.test.ts
   └─ generationAdapters.test.ts
```

---

## Interfaz de generación (contrato)
```ts
export type GenParams = {
  name: string;
  profession: string;
  userImage: File | Blob; // foto fuente
};

export type GenResult = {
  imageUrl: string;     // URL http(s) o data URL
  description: string;  // 2–3 líneas en español
};

export interface ImageTextGenerator {
  generate(payload: GenParams): Promise<GenResult>;
}
```

---

## Construcción de prompts
### Prompt **de imagen** (en inglés)
```
Portrait of <NAME> as an epic superhero version of a <PROFESSION>, 
ultra-detailed, dramatic lighting, cinematic, award-winning photography, 
hero pose, dynamic composition, majestic environment: <SCENARIO_BY_PROFESSION>, 
realistic face identical to the input photo, sharp focus, 8k, masterpiece.

Negative: deformed face, disfigured, extra limbs, duplicate, low-res, blurry.
```
- Parámetros recomendados (si aplica): `size=1024x1024`, `denoising_strength=0.25–0.35`, `cfg_scale=6–8`, sampler equivalente a `k_euler_a`, `upscale=2x` opcional.

### Prompt **de texto** (descripción en español)
```
Tono épico, motivacional, inclusivo. Devuelve 2–3 líneas (25–60 palabras). 
Incluye el nombre y la profesión, destacando su aporte y que "esa profesión vale" en la empresa. 
Sin emojis, sin comillas, sin prefijos.
Datos: nombre=<NAME>, profesión=<PROFESSION>.
```

---

## Integración con proveedores (mínimo 2)
1. **OpenAI‑style**: endpoint de imágenes (variations/edits o image‑to‑image si disponible) + endpoint de chat/completions para el texto. Manejar subida del **init image** y el **prompt** anterior. 
2. **Stability‑style**: endpoint *image‑to‑image* (`init_image`, `cfg_scale`, `style_preset=cinematic`) + LLM para texto.

Ambos adaptadores deben mantener la **misma interfaz** (`ImageTextGenerator`). Claves en **.env** y uso a través de un **proxy backend local** opcional (si la clave no debe exponerse). 

---

## Accesibilidad y privacidad
- Etiquetas y `aria-*` correctas; `aria-live` para estados de carga y errores; navegación por teclado; foco visible. 
- Mostrar **consentimiento** explícito antes de subir la foto a la API. 
- No almacenar imágenes sin aviso; permitir borrar en local. 

---

## Manejo de errores y validaciones
- Validar nombre (2–60 chars), profesión no vacía, imagen PNG/JPG ≤ 2 MB, dimensión mínima 512×512. 
- Errores claros: permisos de cámara, formato/peso de imagen, fallos de API, timeout (backoff x2). 

---

## Botón **Compartir por WhatsApp** (wa.me)
- Componente `ShareWhatsAppButton` que recibe `{ name, profession, description, imageUrl }`. 
- Construye el mensaje multilínea (compacto) y lo abre con `window.open` hacia `https://wa.me/?text=...` usando `encodeURIComponent`. 
- **Nota**: WhatsApp no adjunta la imagen vía `wa.me`; se envía **enlace** a la imagen. Asegurar que `imageUrl` sea **accesible públicamente** (o subirla a un endpoint propio/CDN si la API devuelve data URI). 
- Ejemplo de mensaje:
  ```
  Mira mi postal épica ✨
  Nombre: <NAME>
  Profesión: <PROFESSION>
  <DESCRIPTION EN 2–3 LÍNEAS>
  <IMAGE_URL>
  ```

---

## Criterios de aceptación
- Puedo **capturar** o **subir** una foto, escribir **nombre** y elegir **profesión**. 
- Al generar, obtengo una **postal** con **imagen** (rostro idéntico), **nombre** y **2–3 líneas** en español destacando su labor en la empresa. 
- Puedo **compartir por WhatsApp** mediante `wa.me` con mensaje prellenado + enlace a la imagen. 
- Puedo **descargar JSON** con `name`, `profession`, `description`, `imageUrl`, `createdAt`. 
- UI responsiva, accesible, tema claro/oscuro, rendimiento correcto.

---

## Entregables obligatorios
1. **Repositorio** listo para correr:
   - `README.md` con pasos: `npm i && npm run dev` y configuración de claves/API.
   - Código completo de componentes y adaptadores, incluyendo `ShareWhatsAppButton`.
   - `PROMPTS.md` (este documento) y `./tests` con pruebas básicas.
   - `.env.example` con variables requeridas. 
2. **Mock local** si no hay API key (retornar imagen placeholder y texto simulado) para demo offline.

---

## Extras opcionales
- Exportar la **postal** como imagen PNG (html2canvas o canvas) para descarga local.
- Historial local (IndexedDB) de generaciones previas.
- Selector de estilos (cinematic, comic, neon, barroco) manteniendo la identidad facial.

---

## Notas de implementación sugeridas (no excluyentes)
- **ResultPostcard.tsx**: usa `Card` con layout vertical, imagen arriba, `h2` con nombre, párrafo con 2–3 líneas; botones en `CardFooter`. 
- **promptBuilder.ts**: función `buildImagePrompt(name, profession)` que componga el *scenario* desde el mapeo anterior; `buildTextPrompt(...)` para el copy.
- **openaiAdapter.ts**/**stabilityAdapter.ts**: implementan `generate(...)` devolviendo `{ imageUrl, description }`. 
- **useGenerateEpic.ts**: *hook* con React Query para orquestar la generación y manejar estados.

> **Entrega ahora el repo completo** con esta estructura, los componentes base, estilos Tailwind y los adaptadores (OpenAI listo y Stability con stubs).
