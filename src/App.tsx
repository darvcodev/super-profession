import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FormStep } from "./components/FormStep";
import { CameraCapture } from "./components/CameraCapture";
import { ResultPostcard } from "./components/ResultPostcard";
import { useGenerateEpic } from "./hooks/useGenerateEpic";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Stepper } from "./components/Stepper";
import { AnimatePresence, motion } from "framer-motion";
import type {
  AppStep,
  UserFormData,
  ProcessedImage,
  PostcardData,
  GenParams,
} from "./types";
import { AlertCircle, Sparkles, Loader2 } from "lucide-react";

// Crear cliente de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 2,
    },
  },
});

// Definición de los pasos de la aplicación
const steps = [
  { id: "form", name: "Tus Datos" },
  { id: "photo", name: "Tu Foto" },
  { id: "result", name: "Resultado Épico" },
];

// Componente principal de la aplicación
function EpicPostcardApp() {
  const [currentStep, setCurrentStep] = useState<AppStep>("form");
  const [userData, setUserData] = useState<UserFormData | null>(null);
  const [finalImage, setFinalImage] = useState<ProcessedImage | null>(null);
  const [postcard, setPostcard] = useState<PostcardData | null>(null);
  const [animationDirection, setAnimationDirection] = useState(1);

  // Hook para generación con IA
  const {
    generateEpicAsync,
    isLoading: isGenerating,
    error: generationError,
    reset: resetGeneration,
  } = useGenerateEpic({
    // Usar mock por defecto para demo - en producción se configuraría con API keys
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || undefined,
    onSuccess: (result) => {
      if (userData && finalImage) {
        const newPostcard: PostcardData = {
          name: userData.name,
          profession: userData.profession,
          description: result.description,
          imageUrl: result.imageUrl,
          createdAt: new Date().toISOString(),
        };
        setPostcard(newPostcard);
        setCurrentStep("result");
      }
    },
    onError: (error) => {
      console.error("Error generating postcard:", error);
    },
  });

  // Manejar envío del formulario
  const handleFormSubmit = (data: UserFormData) => {
    setUserData(data);
    setCurrentStep("photo");
  };

  // Manejar captura de imagen
  const handleImageCaptured = (image: ProcessedImage) => {
    setFinalImage(image);
    handleGeneratePostcard(image);
  };

  // Generar postal épica
  const handleGeneratePostcard = async (image: ProcessedImage) => {
    if (!userData) return;

    try {
      const params: GenParams = {
        name: userData.name,
        profession: userData.profession,
        userImage: image.file,
      };

      await generateEpicAsync(params);
    } catch (error) {
      console.error("Error generating epic postcard:", error);
    }
  };

  // Reiniciar aplicación
  const handleRestart = () => {
    setCurrentStep("form");
    setUserData(null);
    setFinalImage(null);
    setPostcard(null);
    resetGeneration();
  };

  // Generar nueva postal (mismos datos, nueva generación)
  const handleGenerateNew = async () => {
    if (!userData || !finalImage) return;

    try {
      const params: GenParams = {
        name: userData.name,
        profession: userData.profession,
        userImage: finalImage.file,
      };

      await generateEpicAsync(params);
    } catch (error) {
      console.error("Error generating new postcard:", error);
    }
  };

  // Volver al paso anterior
  const handleBack = () => {
    setAnimationDirection(-1);
    switch (currentStep) {
      case "photo":
        setCurrentStep("form");
        break;
      case "result":
        setCurrentStep("photo");
        break;
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen-safe bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar con Stepper y branding */}
      <aside className="w-full md:w-1/3 lg:w-1/4 p-8 bg-black/20 border-r border-white/10 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-gradient">
            Super Profession | AI
          </h1>
        </div>

        <Stepper steps={steps} currentStep={currentStep} />

        <div className="mt-auto pt-8">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tu imagen es procesada de forma segura y no se almacena
            permanentemente.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Creado con IA para celebrar el valor de cada profesión ✨
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 relative">
        {/* Botón de Reinicio */}
        {currentStep !== "form" && (
          <div className="absolute top-6 right-6 z-20">
            <Button onClick={handleRestart} variant="outline" size="sm">
              Reiniciar
            </Button>
          </div>
        )}

        {/* Error global */}
        {generationError && (
          <div className="max-w-2xl mx-auto mb-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error en la generación</AlertTitle>
              <AlertDescription>
                {generationError.message}
                <Button
                  onClick={resetGeneration}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Reintentar
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Loading overlay */}
        {isGenerating && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md mx-4">
              <CardContent className="p-6 text-center space-y-4">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    Creando tu postal épica...
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Nuestros artistas de IA están transformando tu imagen en una
                    versión heroica. Esto puede tomar unos momentos.
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full animate-pulse w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Steps con Animación */}
        <AnimatePresence initial={false} custom={animationDirection}>
          <motion.div
            key={currentStep}
            custom={animationDirection}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full h-full"
          >
            {currentStep === "form" && (
              <FormStep
                onNext={handleFormSubmit}
                initialData={userData || undefined}
              />
            )}

            {currentStep === "photo" && !isGenerating && (
              <CameraCapture
                onImageCaptured={handleImageCaptured}
                onBack={handleBack}
              />
            )}

            {currentStep === "result" && postcard && (
              <ResultPostcard
                postcard={postcard}
                onGenerateNew={handleGenerateNew}
                isGenerating={isGenerating}
                onBack={handleBack}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// App wrapper con providers
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EpicPostcardApp />
    </QueryClientProvider>
  );
}

export default App;
