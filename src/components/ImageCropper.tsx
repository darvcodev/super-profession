import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import type { ProcessedImage, CropConfig } from "../types";
import { cropImage } from "../utils/image";
import { Crop, Check, RotateCcw } from "lucide-react";

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  image: ProcessedImage;
  onCropComplete: (croppedImage: ProcessedImage) => void;
  onBack: () => void;
}

export function ImageCropper({
  image,
  onCropComplete,
  onBack,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Callback cuando el crop cambia
  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  // Callback cuando el zoom cambia
  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  // Callback cuando la rotación cambia
  const onRotationChange = useCallback((rotation: number) => {
    setRotation(rotation);
  }, []);

  // Callback cuando se completa el crop
  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // Aplicar el crop
  const applyCrop = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);

    try {
      const cropConfig: CropConfig = {
        x: croppedAreaPixels.x,
        y: croppedAreaPixels.y,
        width: croppedAreaPixels.width,
        height: croppedAreaPixels.height,
      };

      const croppedFile = await cropImage(image.file, cropConfig);

      const croppedImage: ProcessedImage = {
        file: croppedFile,
        preview: URL.createObjectURL(croppedFile),
        dimensions: {
          width: croppedAreaPixels.width,
          height: croppedAreaPixels.height,
        },
      };

      onCropComplete(croppedImage);
    } catch (error) {
      console.error("Error cropping image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Resetear crop
  const resetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Ajusta tu Imagen</h2>
        <p className="text-muted-foreground">
          Recorta y ajusta tu imagen para obtener el mejor resultado épico
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            Editor de Imagen
          </CardTitle>
          <CardDescription>
            Usa los controles para ajustar el encuadre. Se recomienda un corte
            cuadrado 1:1 para mejores resultados.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Área de crop */}
          <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <Cropper
              image={image.preview}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1} // Aspect ratio 1:1 para formato cuadrado
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteCallback}
              onZoomChange={onZoomChange}
              onRotationChange={onRotationChange}
              showGrid={true}
              style={{
                containerStyle: {
                  backgroundColor: "transparent",
                },
                cropAreaStyle: {
                  border: "2px solid #3b82f6",
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                },
                mediaStyle: {
                  transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                },
              }}
            />
          </div>

          {/* Controles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Control de zoom */}
            <div className="space-y-2">
              <Label htmlFor="zoom">Zoom: {Math.round(zoom * 100)}%</Label>
              <input
                id="zoom"
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            {/* Control de rotación */}
            <div className="space-y-2">
              <Label htmlFor="rotation">Rotación: {rotation}°</Label>
              <input
                id="rotation"
                type="range"
                min={-180}
                max={180}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            {/* Botón reset */}
            <div className="flex items-end">
              <Button onClick={resetCrop} variant="outline" className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetear
              </Button>
            </div>
          </div>

          {/* Información de la imagen */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="font-medium mb-2">Información de la imagen:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  Dimensiones originales:
                </span>
                <p>
                  {image.dimensions.width} × {image.dimensions.height} px
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Área seleccionada:
                </span>
                <p>
                  {croppedAreaPixels
                    ? `${Math.round(croppedAreaPixels.width)} × ${Math.round(
                        croppedAreaPixels.height
                      )} px`
                    : "No seleccionada"}
                </p>
              </div>
            </div>
          </div>

          {/* Navegación */}
          <div className="flex justify-between pt-4 border-t">
            <Button onClick={onBack} variant="outline">
              Volver
            </Button>

            <Button
              onClick={applyCrop}
              disabled={!croppedAreaPixels || isProcessing}
              size="lg"
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Crear Postal Épica
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Consejos */}
      <Card className="bg-blue-50 dark:bg-blue-950">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Consejos para el mejor resultado:
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Centra tu rostro en el área de recorte</li>
            <li>• Asegúrate de que tu cara ocupe al menos el 60% del área</li>
            <li>• Mantén los ojos visibles y bien iluminados</li>
            <li>
              • El formato cuadrado funciona mejor para la transformación épica
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
