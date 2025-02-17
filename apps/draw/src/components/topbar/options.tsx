import { MoonIcon, SunIcon } from "lucide-react";
import { useDrawStore } from "@/draw-store";
import { Button } from "@/components/ui/button";

export function Options() {
  const { darkMode, setDarkMode } = useDrawStore();
  return (
    <div className="flex justify-center items-center h-8 px-1">
      <Button
        title={darkMode ? "Light mode" : "Dark mode"}
        variant="ghost"
        className="h-8 w-8 p-0"
        onClick={() => {
          window.editor.setDarkMode(!darkMode);
          setDarkMode(!darkMode);
        }}
      >
        {darkMode ? <MoonIcon size={16} /> : <SunIcon size={16} />}
      </Button>
    </div>
  );
}
