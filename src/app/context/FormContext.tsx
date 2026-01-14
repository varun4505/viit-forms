"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface FormContextType {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState("personal");

  return (
    <FormContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context)
    throw new Error("useFormContext must be used within a FormProvider");
  return context;
}
