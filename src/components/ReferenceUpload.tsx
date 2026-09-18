import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

interface ReferenceUploadProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

const MAX_BYTES = 5 * 1024 * 1024;

export const ReferenceUpload = ({ value, onChange }: ReferenceUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image is too large — please use one under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.onerror = () => toast.error("Could not read that image");
    reader.readAsDataURL(file);
  };

  if (value) {
    return (
      <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-primary/40 group">
        <img src={value} alt="Reference" className="w-full h-full object-cover" />
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="absolute top-1 right-1 h-7 w-7 opacity-90"
          onClick={() => onChange(null)}
          aria-label="Remove reference image"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className="w-32 h-32 rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
      >
        <ImagePlus className="w-6 h-6" />
        <span className="text-xs px-2 text-center">Add reference</span>
      </button>
    </div>
  );
};
