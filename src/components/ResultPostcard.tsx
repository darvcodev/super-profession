import React from "react";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import useWindowSize from "../hooks/useWindowSize";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import type { PostcardData } from "../types";
import { Download, RotateCcw, ArrowLeft } from "lucide-react";
import { ShareWhatsAppButton } from "./ShareWhatsAppButton";

interface ResultPostcardProps {
  postcard: PostcardData;
  onGenerateNew: () => void;
  isGenerating?: boolean;
  onBack: () => void; // Añadido para navegación
}

export function ResultPostcard({
  postcard,
  onGenerateNew,
  isGenerating = false,
  onBack,
}: ResultPostcardProps) {
  const postcardRef = React.useRef<HTMLDivElement>(null);
  const { width, height } = useWindowSize();

  // Descargar como PNG
  const downloadPNG = async () => {
    if (!postcardRef.current) return;

    try {
      // Configuración para alta calidad
      const canvas = await html2canvas(postcardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2, // Mayor resolución
        useCORS: true,
        allowTaint: true,
        height: postcardRef.current.offsetHeight,
        width: postcardRef.current.offsetWidth,
      });

      // Convertir a blob y descargar
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `postal-epica-${postcard.name
              .replace(/\s+/g, "-")
              .toLowerCase()}-${new Date().getTime()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        },
        "image/png",
        1.0
      );
    } catch (error) {
      console.error("Error downloading PNG:", error);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center space-y-6">
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={300}
        gravity={0.1}
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          ¡Tu Postal Épica está Lista!
        </h2>
        <p className="mt-2 text-lg text-muted-foreground">
          Comparte tu transformación heroica con el mundo.
        </p>
      </motion.div>

      {/* Postal Principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.4,
        }}
        className="w-full max-w-md"
      >
        <Card
          ref={postcardRef}
          className="overflow-hidden bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-purple-500/50"
          style={{ aspectRatio: "4/5" }} // Formato poster vertical
        >
          {/* Imagen épica */}
          <div className="relative h-3/5 overflow-hidden">
            <img
              src={postcard.imageUrl}
              alt={`Postal épica de ${postcard.name} como ${postcard.profession}`}
              className="w-full h-full object-cover"
              style={{ objectPosition: "center center" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <CardContent className="h-2/5 flex flex-col justify-center space-y-4 p-6 relative">
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {postcard.name}
            </h1>
            <p className="text-lg font-semibold text-center text-gray-700 dark:text-gray-300">
              {postcard.profession}
            </p>
            <div className="text-center px-2">
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 italic">
                "{postcard.description}"
              </p>
            </div>
            <div className="absolute bottom-2 right-2">
              <p className="text-xs text-gray-400 dark:text-gray-600">
                Creado con IA ✨
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Acciones */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-wrap justify-center gap-3 pt-4"
      >
        <Button onClick={onGenerateNew} disabled={isGenerating}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {isGenerating ? "Generando..." : "Generar Otra"}
        </Button>
        <Button onClick={downloadPNG} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Descargar PNG
        </Button>
        <ShareWhatsAppButton
          name={postcard.name}
          profession={postcard.profession}
          description={postcard.description}
          imageUrl={postcard.imageUrl}
        />
      </motion.div>

      {/* Navegación */}
      <div className="flex justify-start pt-4 w-full max-w-md">
        <Button onClick={onBack} variant="outline" className="group">
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Volver a la foto
        </Button>
      </div>
    </div>
  );
}
