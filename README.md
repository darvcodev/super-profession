# 🎨✨ Postal Épica con IA

Una aplicación web que transforma tu foto en una versión épica de superhéroe acorde a tu profesión, usando inteligencia artificial. Comparte tu transformación heroica y celebra el valor de tu trabajo.

![Postal Épica Demo](https://via.placeholder.com/800x400/6366f1/ffffff?text=Postal+%C3%89pica+con+IA)

## 🚀 Características

- **🦸‍♀️ Transformación Épica**: Convierte tu foto en una versión superhéroe de tu profesión
- **🎯 Profesiones Predefinidas**: 9 profesiones con escenarios épicos únicos + opción personalizada
- **📱 Captura Flexible**: Usa tu cámara o sube una imagen existente
- **🖼️ Editor Integrado**: Recorta y ajusta tu imagen para mejores resultados
- **💬 Compartir WhatsApp**: Comparte tu postal directamente por WhatsApp
- **📥 Múltiples Formatos**: Descarga como JSON o imagen PNG
- **🌙 Tema Claro/Oscuro**: Interfaz adaptable y accesible
- **🚀 Rendimiento Optimizado**: Carga rápida y experiencia fluida

## 🛠️ Tecnologías

### Frontend

- **React 18** + **Vite** - Framework y herramientas de desarrollo
- **TypeScript** - Tipado estático para mayor robustez
- **TailwindCSS** - Estilos utilitarios y diseño responsivo
- **Radix UI** - Componentes accesibles y primitivos
- **TanStack Query** - Manejo de estado y caché de APIs
- **React Hook Form + Zod** - Formularios y validación
- **react-webcam** - Captura de cámara
- **react-easy-crop** - Editor de imágenes
- **html2canvas** - Exportación a imagen

### IA y APIs

- **OpenAI API** - DALL-E 3 para imágenes + GPT-4 para texto
- **Stability AI** - Generación image-to-image (alternativa)
- **Modo Mock** - Demo sin necesidad de API keys

### Desarrollo

- **Vitest** + **Testing Library** - Testing unitario
- **ESLint** + **Prettier** - Linting y formateo
- **TypeScript** - Tipado estático

## 🏗️ Arquitectura del Proyecto

```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes base (Button, Card, etc.)
│   ├── FormStep.tsx     # Formulario de datos personales
│   ├── CameraCapture.tsx # Captura de cámara/imagen
│   ├── ImageCropper.tsx # Editor de imágenes
│   ├── ResultPostcard.tsx # Postal épica final
│   └── ShareWhatsAppButton.tsx # Botón de compartir
├── lib/                 # Lógica de negocio
│   ├── generation.ts    # Interfaz común de generadores
│   ├── promptBuilder.ts # Construcción de prompts
│   ├── openaiAdapter.ts # Adaptador OpenAI
│   └── stabilityAdapter.ts # Adaptador Stability AI
├── hooks/               # Hooks personalizados
│   └── useGenerateEpic.ts # Hook principal de generación
├── utils/               # Utilidades
│   └── image.ts         # Procesamiento de imágenes
├── types/               # Tipos TypeScript
│   └── index.ts         # Definiciones de tipos
└── styles/              # Estilos
    └── tailwind.css     # Configuración Tailwind
```

## 🚀 Inicio Rápido

### 1. Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/super-profession.git
cd super-profession

# Instalar dependencias
npm install
```

### 2. Configuración (Opcional)

Para usar IA real, configura tus API keys:

```bash
# Copiar archivo de configuración
cp env.example .env

# Editar .env con tus claves de API
# VITE_OPENAI_API_KEY=sk-tu-clave-openai
# VITE_STABILITY_API_KEY=sk-tu-clave-stability
```

**📝 Nota**: La aplicación funciona en modo demo sin API keys.

### 3. Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:5173
```

### 4. Testing

```bash
# Ejecutar tests
npm run test

# Tests en modo watch
npm run test --watch
```

### 5. Producción

```bash
# Build para producción
npm run build

# Preview del build
npm run preview
```

## 🎯 Uso de la Aplicación

### Paso 1: Datos Personales

1. Ingresa tu nombre completo
2. Selecciona tu profesión o elige "Personalizada"
3. Acepta el consentimiento para procesamiento de imagen

### Paso 2: Captura de Imagen

1. **Opción A**: Usa tu cámara para tomar una foto
2. **Opción B**: Sube una imagen existente (PNG/JPG, máx. 2MB)
3. Asegúrate de que tu rostro esté bien iluminado y centrado

### Paso 3: Resultado Épico

1. La IA genera tu postal épica automáticamente
2. Comparte por WhatsApp con un clic
3. Descarga como JSON o imagen PNG
4. Genera una nueva versión si deseas

## 🎨 Profesiones Disponibles

| Profesión         | Escenario Épico                                                      |
| ----------------- | -------------------------------------------------------------------- |
| **Ingenier@**     | Exoesqueleto tecnológico, hologramas de circuitos, skyline futurista |
| **Abogad@**       | Capa elegante, balanza de justicia luminosa, juzgado monumental      |
| **Médic@**        | Armadura sanitaria luminosa, nanobots de luz, hospital vanguardista  |
| **Docente**       | Toga de sabio, constelaciones de fórmulas, biblioteca infinita       |
| **Chef**          | Chaqueta épica, torbellino de especias, cocina palaciega             |
| **Arquitect@**    | Planos flotantes, rascacielos en construcción, luz cenital           |
| **Diseñador/a**   | Pinceladas de luz, tipografías flotantes, estudio futurista          |
| **Emprendedor/a** | Gráficos holográficos, ciudad brillante, energía dinámica            |
| **Músic@**        | Ondas sonoras visibles, escenario gigantesco, focos teatrales        |
| **Personalizada** | Escenario deducido automáticamente según profesión                   |

## 🔧 Configuración de APIs

### OpenAI (Recomendado)

```bash
# .env
VITE_OPENAI_API_KEY=sk-tu-clave-aqui
VITE_DEFAULT_PROVIDER=openai
```

- **Pros**: Mejor calidad de imagen y texto, más fácil de configurar
- **Contras**: Más costoso (~$0.041 por postal)

### Stability AI

```bash
# .env
VITE_STABILITY_API_KEY=sk-tu-clave-aqui
VITE_DEFAULT_PROVIDER=stability
```

- **Pros**: Mejor conservación facial, más económico
- **Contras**: Requiere LLM adicional para texto

### Modo Demo

```bash
# No configurar API keys
# La app usará generadores mock automáticamente
```

- **Pros**: Gratuito, perfecto para desarrollo
- **Contras**: Imágenes placeholder, texto genérico

## 📱 Compartir por WhatsApp

La función de compartir crea un mensaje con:

- ✨ Encabezado épico
- 👤 Nombre y profesión
- 📝 Descripción motivacional (2-3 líneas)
- 🖼️ Enlace a la imagen generada

```
Mira mi postal épica ✨

Nombre: María González
Profesión: Ingeniera

María González es una Ingeniera excepcional que transforma
cada desafío en una oportunidad brillante...

https://ejemplo.com/imagen-epica.jpg
```

## 🧪 Testing

```bash
# Ejecutar toda la suite de tests
npm run test

# Tests específicos
npm run test promptBuilder.test.ts
npm run test generationAdapters.test.ts

# Coverage
npm run test -- --coverage
```

### Tests Incluidos

- ✅ **promptBuilder.test.ts**: Construcción de prompts y validaciones
- ✅ **generationAdapters.test.ts**: Adaptadores de IA y manejo de errores
- ✅ Mocks para APIs externas
- ✅ Validaciones de entrada
- ✅ Manejo de casos edge

## 🎨 Personalización

### Agregar Nueva Profesión

```typescript
// src/lib/promptBuilder.ts
export const PROFESSION_CONFIGS: ProfessionConfig[] = [
  // ... profesiones existentes
  {
    value: "Científico/a",
    label: "Científico/a",
    scenario: "laboratorio cuántico, fórmulas luminosas, experimentos cósmicos",
  },
];
```

### Personalizar Estilos

```css
/* src/styles/tailwind.css */
@layer components {
  .mi-estilo-personalizado {
    @apply bg-gradient-to-r from-custom-color to-another-color;
  }
}
```

### Agregar Nuevo Proveedor de IA

```typescript
// src/lib/miProveedorAdapter.ts
export class MiProveedorAdapter extends BaseGenerator {
  async generate(payload: GenParams): Promise<GenResult> {
    // Implementar lógica del proveedor
  }
}

// Registrar en GeneratorFactory
```

## 🚨 Solución de Problemas

### Error: "API key no configurada"

- Verifica que el archivo `.env` existe y tiene las claves correctas
- Asegúrate de que las variables empiecen con `VITE_`
- Reinicia el servidor de desarrollo después de cambiar `.env`

### Error de permisos de cámara

- Permite el acceso a la cámara en tu navegador
- Usa HTTPS en producción (requerido para cámara)
- Como alternativa, usa la opción "Subir imagen"

### Imagen final de baja calidad

- Usa una imagen de al menos 512x512 píxeles
- Asegúrate de buena iluminación en la foto original
- Evita imágenes muy borrosas o con sombras fuertes

### Error de generación de IA

- Verifica que tienes créditos en tu cuenta de API
- Revisa los logs de la consola para detalles del error
- Como fallback, la app cambiará automáticamente a modo mock

## 📈 Métricas y Analytics

Para habilitar analytics (opcional):

```bash
# .env
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

Eventos rastreados:

- ✅ Generación de postal completada
- ✅ Compartido por WhatsApp
- ✅ Descarga de archivos
- ✅ Errores de API

## 🔐 Seguridad y Privacidad

- **🔒 Procesamiento Local**: Las imágenes se procesan en el navegador
- **🚫 No Almacenamiento**: No guardamos tus fotos permanentemente
- **🔑 API Keys Visibles**: Las claves VITE\_ son visibles al cliente
- **💡 Recomendación**: Usa un proxy backend en producción

## 🚢 Despliegue

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel --prod
```

### Netlify

```bash
npm run build
# Subir carpeta dist/ a Netlify
```

### Variables de Entorno en Producción

```bash
# Configura en tu plataforma de hosting
VITE_OPENAI_API_KEY=sk-prod-key
VITE_STABILITY_API_KEY=sk-prod-key
VITE_DEFAULT_PROVIDER=openai
```

## 🤝 Contribución

1. Fork del repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crea un Pull Request

### Lineamientos

- ✅ Mantén cobertura de tests > 80%
- ✅ Sigue las convenciones de TypeScript
- ✅ Documenta nuevas características
- ✅ Testa en múltiples navegadores

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- **OpenAI** por DALL-E 3 y GPT-4
- **Stability AI** por Stable Diffusion
- **Radix UI** por componentes accesibles
- **Tailwind CSS** por el sistema de utilidades
- **Comunidad Open Source** por las increíbles herramientas

## 📞 Soporte

- 🐛 **Issues**: [GitHub Issues](https://github.com/tu-usuario/super-profession/issues)
- 📧 **Email**: soporte@example.com
- 📖 **Documentación**: [Wiki del proyecto](https://github.com/tu-usuario/super-profession/wiki)

---

<div align="center">

**¡Celebra el valor de tu profesión con una postal épica! ✨**

[Demo en Vivo](https://postal-epica.vercel.app) | [Documentación](https://github.com/tu-usuario/super-profession/wiki) | [Reportar Bug](https://github.com/tu-usuario/super-profession/issues)

</div>
