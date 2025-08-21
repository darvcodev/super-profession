// Tipos principales según las especificaciones del PROMPT.md

export type Profession = 
  | 'Ingenier@'
  | 'Abogad@'
  | 'Médic@'
  | 'Diseñador/a'
  | 'Docente'
  | 'Chef'
  | 'Arquitect@'
  | 'Emprendedor/a'
  | 'Músic@'
  | 'Personalizada';

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

// Tipo para el resultado completo de la postal
export type PostcardData = {
  name: string;
  profession: string;
  description: string;
  imageUrl: string;
  createdAt: string; // ISO8601
};

// Tipos para el formulario
export type UserFormData = {
  name: string;
  profession: string;
  customProfession?: string;
  hasConsent: boolean;
  userImage?: File;
};

// Estados de la aplicación
export type AppStep = 'form' | 'photo' | 'result';

// Configuración de profesiones con sus escenarios épicos
export type ProfessionConfig = {
  value: string;
  label: string;
  scenario: string; // Descripción del escenario épico para el prompt
};

// Tipos para la captura de imagen
export type ImageCaptureMode = 'camera' | 'upload';

// Configuración de la API
export type ApiProvider = 'openai' | 'stability';

export type ApiConfig = {
  provider: ApiProvider;
  apiKey: string;
  baseUrl?: string;
};

// Error personalizado
export type AppError = {
  code: string;
  message: string;
  details?: any;
};

// Resultado del procesamiento de imagen
export type ProcessedImage = {
  file: File;
  preview: string;
  dimensions: {
    width: number;
    height: number;
  };
};

// Configuración del crop de imagen
export type CropConfig = {
  x: number;
  y: number;
  width: number;
  height: number;
};

// Tipos para WhatsApp sharing
export type WhatsAppShareData = {
  name: string;
  profession: string;
  description: string;
  imageUrl: string;
};
