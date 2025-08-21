import React, { useRef, useCallback, useState } from "react";
import Webcam from "react-webcam";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { processImage } from "../utils/image";
import type { ProcessedImage, ImageCaptureMode } from "../types";
import {
  Camera,
  Upload,
  RotateCcw,
  Check,
  AlertCircle,
  ArrowLeft,
  Lightbulb,
} from "lucide-react";

interface CameraCaptureProps {
  onImageCaptured: (image: ProcessedImage) => void;
  onBack: () => void;
}

export function CameraCapture({ onImageCaptured, onBack }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<ImageCaptureMode>("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string>("");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  // Configuración de la webcam
  const videoConstraints = {
    width: 1024,
    height: 1024,
    facingMode: "user",
    deviceId: deviceId ? { exact: deviceId } : undefined,
  };

  // Obtener dispositivos de cámara disponibles
  const handleDevices = useCallback(
    (mediaDevices: MediaDeviceInfo[]) => {
      const videoDevices = mediaDevices.filter(
        ({ kind }) => kind === "videoinput"
      );
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !deviceId) {
        setDeviceId(videoDevices[0].deviceId);
      }
    },
    [deviceId]
  );

  React.useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  // Capturar imagen desde la cámara
  const capturePhoto = useCallback(() => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setError(null);
    }
  }, []);

  // Manejar subida de archivo
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setCapturedImage(result);
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    },
    []
  );

  // Procesar y confirmar imagen
  const confirmImage = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Convertir base64 a File
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], "captured-image.jpg", {
        type: "image/jpeg",
      });

      // Procesar imagen
      const processedImage = await processImage(file);
      onImageCaptured(processedImage);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al procesar la imagen"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Reiniciar captura
  const resetCapture = () => {
    setCapturedImage(null);
    setError(null);
    setCameraError(null);
  };

  // Cambiar cámara
  const switchCamera = () => {
    const currentIndex = devices.findIndex(
      (device) => device.deviceId === deviceId
    );
    const nextIndex = (currentIndex + 1) % devices.length;
    setDeviceId(devices[nextIndex]?.deviceId || "");
  };

  // Manejar errores de cámara
  const handleCameraError = () => {
    setCameraError(
      "No se pudo acceder a la cámara. Verifica los permisos o usa la opción de subir archivo."
    );
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Captura tu Foto
          </h2>
          <p className="text-lg text-muted-foreground">
            Una buena foto es clave para una postal épica.
          </p>
        </div>

        <Card>
          <CardHeader>
            {/* Selector de modo */}
            <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg p-1">
              <Button
                variant={mode === "camera" ? "secondary" : "ghost"}
                onClick={() => setMode("camera")}
                className="flex-1 flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Usar Cámara
              </Button>
              <Button
                variant={mode === "upload" ? "secondary" : "ghost"}
                onClick={() => setMode("upload")}
                className="flex-1 flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Subir Imagen
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {cameraError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error de Cámara</AlertTitle>
                <AlertDescription>{cameraError}</AlertDescription>
              </Alert>
            )}

            {/* Vista de cámara */}
            {mode === "camera" && !capturedImage && (
              <div className="space-y-4">
                <div className="relative mx-auto w-full aspect-square max-w-sm rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    height={320}
                    width={320}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    onUserMediaError={handleCameraError}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex gap-2 justify-center">
                  <Button onClick={capturePhoto} size="lg">
                    <Camera className="h-4 w-4 mr-2" />
                    Tomar Foto
                  </Button>

                  {devices.length > 1 && (
                    <Button onClick={switchCamera} variant="outline">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Subida de archivo */}
            {mode === "upload" && !capturedImage && (
              <div className="space-y-4">
                <div
                  className="mx-auto w-full aspect-square max-w-sm rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Haz clic para seleccionar una imagen
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG hasta 2MB</p>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Vista previa de imagen capturada */}
            {capturedImage && (
              <div className="space-y-4">
                <div className="mx-auto w-full aspect-square max-w-sm rounded-lg overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700">
                  <img
                    src={capturedImage}
                    alt="Imagen capturada"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={confirmImage}
                    disabled={isProcessing}
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
                        Confirmar y Generar
                      </>
                    )}
                  </Button>

                  <Button onClick={resetCapture} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Tomar Otra
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consejos para mejor captura */}
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Consejos para la mejor postal:</AlertTitle>
          <AlertDescription>
            Usa buena iluminación, mantén el rostro centrado y evita sombras
            fuertes.
          </AlertDescription>
        </Alert>

        {/* Navegación */}
        <div className="flex justify-start pt-4">
          <Button onClick={onBack} variant="outline" className="group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Volver
          </Button>
        </div>
      </div>
    </div>
  );
}
