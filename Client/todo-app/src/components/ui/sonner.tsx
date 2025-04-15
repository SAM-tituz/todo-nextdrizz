"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

const Toaster = () => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as "light" | "dark" | "system"}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "bg-background text-foreground border rounded-lg shadow-lg px-4 py-2 flex items-center gap-2",
          error: "!bg-red-500 !text-white !border-red-600",
          success: "!bg-green-500 !text-white",
          warning: "!bg-yellow-500 !text-white",
          info: "!bg-blue-500 !text-white",
        },
      }}
    />
  )
}

export { Toaster }