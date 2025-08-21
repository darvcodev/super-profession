import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import type { UserFormData } from "../types";
import { PROFESSION_CONFIGS } from "../lib/promptBuilder";
import { AlertCircle, ArrowRight } from "lucide-react";

// Schema de validación
const formSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(60, "El nombre no puede tener más de 60 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras y espacios"),
  profession: z.string().min(1, "Debes seleccionar una profesión"),
  customProfession: z.string().optional(),
  hasConsent: z
    .boolean()
    .refine(
      (val) => val === true,
      "Debes aceptar el procesamiento de tu imagen"
    ),
});

type FormData = z.infer<typeof formSchema>;

interface FormStepProps {
  onNext: (data: UserFormData) => void;
  initialData?: Partial<UserFormData>;
}

export function FormStep({ onNext, initialData }: FormStepProps) {
  const [selectedProfession, setSelectedProfession] = React.useState<string>(
    initialData?.profession || ""
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      profession: initialData?.profession || "",
      customProfession: initialData?.customProfession || "",
      hasConsent: initialData?.hasConsent || false,
    },
  });

  const watchedProfession = watch("profession");

  const onSubmit = (data: FormData) => {
    const finalProfession =
      data.profession === "Personalizada"
        ? data.customProfession || "Profesional"
        : data.profession;

    onNext({
      name: data.name,
      profession: finalProfession,
      customProfession: data.customProfession,
      hasConsent: data.hasConsent,
    });
  };

  const handleProfessionChange = (value: string) => {
    setSelectedProfession(value);
    setValue("profession", value);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Crea tu Postal Épica
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Cuéntanos un poco sobre ti para empezar.
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Tus Datos</CardTitle>
            <CardDescription>
              Esta información nos ayudará a crear una imagen que te represente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Campo Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  placeholder="Ej: María González"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Campo Profesión */}
              <div className="space-y-2">
                <Label htmlFor="profession">Profesión</Label>
                <Select
                  onValueChange={handleProfessionChange}
                  value={selectedProfession}
                >
                  <SelectTrigger
                    className={errors.profession ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Selecciona tu profesión" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFESSION_CONFIGS.map((prof) => (
                      <SelectItem key={prof.value} value={prof.value}>
                        {prof.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.profession && (
                  <p className="text-sm text-red-500">
                    {errors.profession.message}
                  </p>
                )}
              </div>

              {/* Campo Profesión Personalizada */}
              {watchedProfession === "Personalizada" && (
                <div className="space-y-2">
                  <Label htmlFor="customProfession">
                    Especifica tu profesión
                  </Label>
                  <Input
                    id="customProfession"
                    placeholder="Ej: Científico de datos, Terapeuta ocupacional..."
                    {...register("customProfession")}
                  />
                </div>
              )}

              {/* Preview de la profesión seleccionada */}
              {selectedProfession && selectedProfession !== "Personalizada" && (
                <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="font-semibold text-sm text-purple-600 dark:text-purple-400">
                    Tu escenario épico será:
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                    {
                      PROFESSION_CONFIGS.find(
                        (p) => p.value === selectedProfession
                      )?.scenario
                    }
                  </p>
                </div>
              )}

              {/* Consentimiento */}
              <div className="space-y-4">
                <Alert
                  variant="default"
                  className="bg-transparent border-slate-200 dark:border-slate-700"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Al continuar, aceptas que tu imagen sea procesada por una IA
                    para crear tu postal.
                  </AlertDescription>
                </Alert>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="hasConsent"
                    {...register("hasConsent")}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <Label
                    htmlFor="hasConsent"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Acepto el procesamiento de mi imagen.
                  </Label>
                </div>
                {errors.hasConsent && (
                  <p className="text-sm text-red-500 -mt-2">
                    {errors.hasConsent.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full group" size="lg">
                Siguiente: Tu Foto
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
