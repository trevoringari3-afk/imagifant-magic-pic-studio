import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Download, RotateCw, FlipHorizontal, FlipVertical, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ImageEditorProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageEditor = ({ imageUrl, isOpen, onClose }: ImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (imageUrl && isOpen) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => setOriginalImage(img);
      img.src = imageUrl;
    }
  }, [imageUrl, isOpen]);

  useEffect(() => {
    if (originalImage && canvasRef.current) {
      applyFilters();
    }
  }, [originalImage, brightness, contrast, saturation, rotation, flipH, flipV]);

  const applyFilters = () => {
    if (!canvasRef.current || !originalImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size based on rotation
    if (rotation % 180 === 90) {
      canvas.width = originalImage.height;
      canvas.height = originalImage.width;
    } else {
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    // Draw image
    ctx.drawImage(
      originalImage,
      -originalImage.width / 2,
      -originalImage.height / 2,
      originalImage.width,
      originalImage.height
    );

    // Restore context
    ctx.restore();
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (!blob) {
        toast.error("Failed to create image");
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edited-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully!");
    });
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Edit Image
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Canvas Preview */}
          <div className="flex justify-center bg-muted/20 rounded-lg p-4 overflow-auto">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[400px] rounded-lg shadow-lg"
            />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Brightness: {brightness}%</Label>
              <Slider
                value={[brightness]}
                onValueChange={([value]) => setBrightness(value)}
                min={0}
                max={200}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Contrast: {contrast}%</Label>
              <Slider
                value={[contrast]}
                onValueChange={([value]) => setContrast(value)}
                min={0}
                max={200}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Saturation: {saturation}%</Label>
              <Slider
                value={[saturation]}
                onValueChange={([value]) => setSaturation(value)}
                min={0}
                max={200}
                step={1}
              />
            </div>

            {/* Transform Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation((r) => (r + 90) % 360)}
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Rotate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFlipH(!flipH)}
              >
                <FlipHorizontal className="w-4 h-4 mr-2" />
                Flip H
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFlipV(!flipV)}
              >
                <FlipVertical className="w-4 h-4 mr-2" />
                Flip V
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
