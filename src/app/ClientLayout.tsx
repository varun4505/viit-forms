"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { FormProvider } from "./context/FormContext";
import SidePanel from "./components/SidePanel";
import styles from "./components/SidePanel.module.css";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <FormProvider>
      <div className="flex flex-col md:flex-row h-screen w-full bg-black overflow-hidden relative">
        {/* --- LEFT PANEL (Header on Mobile / SidePanel on Desktop) --- */}
        <div
          className={`
            flex-shrink-0 bg-neutral-900 border-b md:border-b-0 md:border-r border-white/10 relative z-20 transition-all duration-700 ease-in-out
            ${styles.panelContainer}
            ${
              isHome
                ? "w-full h-full"
                : "w-full h-[100px] md:h-full md:w-[40%] lg:w-[35%]"
            } 
          `}
        >
          <SidePanel variant={isHome ? "home" : "form"} />
        </div>

        {/* --- RIGHT PANEL (Content / Form) --- */}
        <div
          className={`
            flex-grow overflow-y-auto relative z-10 bg-black transition-all duration-700 ease-in-out
            ${styles.contentContainer}
            ${
              isHome
                ? "h-0 w-full opacity-0 pointer-events-none"
                : "h-full w-full opacity-100"
            }
          `}
        >
          {children}
        </div>
      </div>
    </FormProvider>
  );
}
