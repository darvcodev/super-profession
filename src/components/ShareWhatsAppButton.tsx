import React from "react";
import { Button } from "./ui/button";
import type { WhatsAppShareData } from "../types";
import { buildWhatsAppMessage } from "../lib/promptBuilder";
import { Share, MessageCircle } from "lucide-react";
import { clsx } from "clsx";

interface ShareWhatsAppButtonProps extends WhatsAppShareData {
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary";
}

export function ShareWhatsAppButton({
  name,
  profession,
  description,
  imageUrl,
  className,
  size = "default",
  variant = "default",
}: ShareWhatsAppButtonProps) {
  const handleWhatsAppShare = () => {
    try {
      // Construir el mensaje usando el helper del promptBuilder
      const message = buildWhatsAppMessage(
        name,
        profession,
        description,
        imageUrl
      );

      // Crear la URL de WhatsApp
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

      // Abrir en nueva ventana/pestaña
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");

      // Analytics opcional (si se implementa)
      if (typeof window !== "undefined" && "gtag" in window) {
        // @ts-ignore
        window.gtag("event", "share", {
          method: "whatsapp",
          content_type: "epic_postcard",
          content_id: `${name}-${profession}`,
        });
      }
    } catch (error) {
      console.error("Error sharing to WhatsApp:", error);

      // Fallback: copiar al portapapeles si WhatsApp falla
      const fallbackMessage = `Mira mi postal épica ✨\n\nNombre: ${name}\nProfesión: ${profession}\n\n${description}\n\n${imageUrl}`;

      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(fallbackMessage)
          .then(() => {
            alert(
              "Mensaje copiado al portapapeles. Puedes pegarlo en WhatsApp manualmente."
            );
          })
          .catch(() => {
            alert("No se pudo abrir WhatsApp. Intenta compartir manualmente.");
          });
      } else {
        alert("No se pudo abrir WhatsApp. Intenta compartir manualmente.");
      }
    }
  };

  // Verificar que tenemos todos los datos necesarios
  const isDisabled = !name || !profession || !description || !imageUrl;

  return (
    <Button
      onClick={handleWhatsAppShare}
      disabled={isDisabled}
      size={size}
      variant={variant}
      className={clsx(
        "flex items-center gap-2",
        "bg-green-600 hover:bg-green-700 text-white",
        "dark:bg-green-600 dark:hover:bg-green-700",
        "transition-colors duration-200",
        className
      )}
      aria-label={`Compartir postal de ${name} por WhatsApp`}
    >
      <MessageCircle className="h-4 w-4" />
      <span>Compartir por WhatsApp</span>
      <Share className="h-3 w-3" />
    </Button>
  );
}

/**
 * Versión simplificada del botón para contextos donde se necesita menos espacio
 */
export function ShareWhatsAppButtonCompact({
  name,
  profession,
  description,
  imageUrl,
  className,
}: WhatsAppShareData & { className?: string }) {
  const handleWhatsAppShare = () => {
    try {
      const message = buildWhatsAppMessage(
        name,
        profession,
        description,
        imageUrl
      );
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error sharing to WhatsApp:", error);
    }
  };

  const isDisabled = !name || !profession || !description || !imageUrl;

  return (
    <Button
      onClick={handleWhatsAppShare}
      disabled={isDisabled}
      size="sm"
      className={clsx(
        "bg-green-600 hover:bg-green-700 text-white p-2",
        className
      )}
      aria-label="Compartir por WhatsApp"
    >
      <MessageCircle className="h-4 w-4" />
    </Button>
  );
}

/**
 * Hook personalizado para manejar el sharing de WhatsApp
 * Útil si necesitas lógica de sharing en otros componentes
 */
export function useWhatsAppShare() {
  const shareToWhatsApp = React.useCallback((data: WhatsAppShareData) => {
    try {
      const message = buildWhatsAppMessage(
        data.name,
        data.profession,
        data.description,
        data.imageUrl
      );

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");

      return { success: true };
    } catch (error) {
      console.error("Error sharing to WhatsApp:", error);
      return { success: false, error };
    }
  }, []);

  return { shareToWhatsApp };
}
