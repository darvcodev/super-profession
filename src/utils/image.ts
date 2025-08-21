import type { ProcessedImage, CropConfig } from "../types";

// Constantes para validación
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_DIMENSION = 1024;
export const MIN_DIMENSION = 512;
export const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

/**
 * Valida si un archivo es una imagen válida
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Formato no válido. Solo se permiten archivos PNG y JPG.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "El archivo es demasiado grande. Máximo 2MB permitido.",
    };
  }

  return { valid: true };
}

/**
 * Obtiene las dimensiones de una imagen
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo cargar la imagen"));
    };

    img.src = url;
  });
}

/**
 * Valida las dimensiones mínimas de una imagen
 */
export async function validateImageDimensions(
  file: File
): Promise<{ valid: boolean; error?: string }> {
  try {
    const dimensions = await getImageDimensions(file);

    if (dimensions.width < MIN_DIMENSION || dimensions.height < MIN_DIMENSION) {
      return {
        valid: false,
        error: `La imagen debe tener al menos ${MIN_DIMENSION}x${MIN_DIMENSION} píxeles.`,
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: "No se pudo procesar la imagen.",
    };
  }
}

/**
 * Comprime una imagen a las dimensiones y calidad especificadas
 */
export function compressImage(
  file: File,
  maxWidth: number = MAX_DIMENSION,
  maxHeight: number = MAX_DIMENSION,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    if (!ctx) {
      reject(new Error("No se pudo crear el contexto del canvas"));
      return;
    }

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo proporción
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a blob y luego a file
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error("No se pudo comprimir la imagen"));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Aplica crop a una imagen
 */
export function cropImage(file: File, cropConfig: CropConfig): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    if (!ctx) {
      reject(new Error("No se pudo crear el contexto del canvas"));
      return;
    }

    img.onload = () => {
      canvas.width = cropConfig.width;
      canvas.height = cropConfig.height;

      ctx.drawImage(
        img,
        cropConfig.x,
        cropConfig.y,
        cropConfig.width,
        cropConfig.height,
        0,
        0,
        cropConfig.width,
        cropConfig.height
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(croppedFile);
          } else {
            reject(new Error("No se pudo recortar la imagen"));
          }
        },
        file.type,
        0.9
      );
    };

    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Procesa una imagen completa: validación, compresión y redimensionamiento si es necesario
 */
export async function processImage(file: File): Promise<ProcessedImage> {
  // Validar archivo
  const fileValidation = validateImageFile(file);
  if (!fileValidation.valid) {
    throw new Error(fileValidation.error);
  }

  // Comprimir imagen a un tamaño máximo
  let processedFile = await compressImage(
    file,
    MAX_DIMENSION,
    MAX_DIMENSION,
    0.9
  );

  // Validar dimensiones y redimensionar si es necesario
  const dimensions = await getImageDimensions(processedFile);
  if (dimensions.width < MIN_DIMENSION || dimensions.height < MIN_DIMENSION) {
    // Si es más pequeña que el mínimo, la redimensionamos hacia arriba
    processedFile = await compressImage(
      processedFile,
      MIN_DIMENSION,
      MIN_DIMENSION,
      0.95
    );
  }

  const finalDimensions = await getImageDimensions(processedFile);

  return {
    file: processedFile,
    preview: URL.createObjectURL(processedFile),
    dimensions: finalDimensions,
  };
}

/**
 * Convierte un archivo a base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("No se pudo convertir el archivo a base64"));
      }
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo"));
    reader.readAsDataURL(file);
  });
}

/**
 * Convierte base64 a File
 */
export function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}
