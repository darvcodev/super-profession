import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import useWindowSize from "../hooks/useWindowSize";
import { Button } from "./ui/button";
import type { PostcardData } from "../types";
import { Download, RotateCcw, ArrowLeft } from "lucide-react";
import { ShareWhatsAppButton } from "./ShareWhatsAppButton";
import { Card, CardContent } from "./ui/card"; // Mantener Card para el fondo

interface ResultPostcardProps {
  postcard: PostcardData;
  onGenerateNew: () => void;
  isGenerating?: boolean;
  onBack: () => void;
}

// Función para componer la imagen final estilo Polaroid
const composePolaroidImage = (
  imageUrl: string,
  name: string,
  description: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageUrl;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context not available"));

      // Dimensiones de la Polaroid (aspect ratio 4:5)
      const canvasWidth = 800;
      const canvasHeight = 1000;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Fondo blanco de la Polaroid
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Margen
      const margin = 40;
      const innerWidth = canvasWidth - margin * 2;
      const innerHeight = 700; // Altura fija para la imagen

      // Dibujar la imagen generada
      ctx.drawImage(image, margin, margin, innerWidth, innerHeight);

      // Área de texto
      ctx.fillStyle = "black";
      ctx.textAlign = "center";

      // Dibujar Nombre
      ctx.font = "bold 64px 'Helvetica', sans-serif";
      ctx.fillText(name, canvasWidth / 2, innerHeight + margin + 80);

      // Dibujar Descripción
      ctx.font = "italic 42px 'Georgia', serif";
      ctx.fillStyle = "#333";
      ctx.fillText(
        `"${description}"`,
        canvasWidth / 2,
        innerHeight + margin + 160
      );

      resolve(canvas.toDataURL("image/png"));
    };

    image.onerror = () => {
      reject(new Error("Failed to load image for composition"));
    };
  });
};

export function ResultPostcard({
  postcard,
  onGenerateNew,
  isGenerating = false,
  onBack,
}: ResultPostcardProps) {
  const { width, height } = useWindowSize();
  const [composedImageUrl, setComposedImageUrl] = useState<string | null>(null);
  const [compositionError, setCompositionError] = useState<string | null>(null);

  useEffect(() => {
    const generateComposedImage = async () => {
      try {
        setCompositionError(null);
        const dataUrl = await composePolaroidImage(
          postcard.imageUrl,
          postcard.name,
          postcard.description
        );
        setComposedImageUrl(dataUrl);
      } catch (error) {
        console.error("Error composing image:", error);
        setCompositionError("Hubo un error al crear la imagen final.");
        // Como fallback, muestra la imagen original de la IA
        setComposedImageUrl(postcard.imageUrl);
      }
    };

    if (postcard) {
      generateComposedImage();
    }
  }, [postcard]);

  const downloadPNG = useCallback(() => {
    if (!composedImageUrl) return;
    const link = document.createElement("a");
    link.href = composedImageUrl;
    link.download = `postal-epica-${postcard.name
      .replace(/\s+/g, "-")
      .toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [composedImageUrl, postcard.name]);

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
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          ¡Tu Postal Épica está Lista!
        </h2>
        <p className="mt-2 text-lg text-muted-foreground">
          Descárgala y compártela con el mundo.
        </p>
      </motion.div>

      {/* Postal Compuesta */}
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
        {composedImageUrl ? (
          <img
            src={composedImageUrl}
            alt={`Postal épica final de ${postcard.name}`}
            className="rounded-lg shadow-2xl w-full"
          />
        ) : (
          <Card className="aspect-[4/5] flex items-center justify-center">
            <CardContent className="p-6 text-center">
              <p>Generando tu postal...</p>
            </CardContent>
          </Card>
        )}
        {compositionError && (
          <p className="text-red-500 mt-2">{compositionError}</p>
        )}
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
        <Button
          onClick={downloadPNG}
          variant="outline"
          disabled={!composedImageUrl}
        >
          <Download className="h-4 w-4 mr-2" />
          Descargar PNG
        </Button>
        <ShareWhatsAppButton
          name={postcard.name}
          profession={postcard.profession}
          description={postcard.description}
          imageUrl={postcard.imageUrl}
          disabled={!composedImageUrl}
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
