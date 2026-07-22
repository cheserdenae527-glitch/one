"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StoreForm } from "@/components/forms/store-form";
import { PersonaSelector } from "@/components/forms/persona-selector";
import type { StoreFormData } from "@/components/forms/store-form";
import type { BrandPersona } from "@/types";
import { toast } from "sonner";

export default function OnboardingPage() {
  const [step, setStep] = useState<"store" | "persona">("store");
  const router = useRouter();

  function handleStoreSubmit(data: StoreFormData) {
    console.log("Store data:", data);
    toast.success("店铺信息已保存");
    setStep("persona");
  }

  function handlePersonaSelect(persona: BrandPersona) {
    console.log("Persona:", persona);
    toast.success("人设已确认");
    router.push("/operations");
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>
          {step === "store" ? "填写店铺信息" : "选择品牌人设"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === "store" ? (
          <StoreForm onSubmit={handleStoreSubmit} />
        ) : (
          <PersonaSelector onSelect={handlePersonaSelect} />
        )}
      </CardContent>
    </Card>
  );
}
