import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type StylePreset = {
  id: string;
  name: string;
  description: string;
  prompt: string;
};

export const stylePresets: StylePreset[] = [
  {
    id: "none",
    name: "No Style",
    description: "Pure prompt, no modifications",
    prompt: "",
  },
  {
    id: "realistic",
    name: "Ultra Realistic",
    description: "Photorealistic, high detail",
    prompt: "ultra realistic, 8k, photorealistic, highly detailed, professional photography",
  },
  {
    id: "anime",
    name: "Anime",
    description: "Japanese animation style",
    prompt: "anime style, studio ghibli inspired, vibrant colors, detailed illustration",
  },
  {
    id: "comic",
    name: "Comic Book",
    description: "Bold lines and colors",
    prompt: "comic book style, bold lines, vibrant colors, pop art, graphic novel",
  },
  {
    id: "fantasy",
    name: "Fantasy Art",
    description: "Magical and ethereal",
    prompt: "fantasy art, magical atmosphere, ethereal lighting, epic composition",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Neon-lit futuristic",
    prompt: "cyberpunk style, neon lights, futuristic, high tech, dystopian atmosphere",
  },
];

interface StylePresetsProps {
  selectedStyle: string;
  onStyleSelect: (styleId: string) => void;
}

export const StylePresets = ({ selectedStyle, onStyleSelect }: StylePresetsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {stylePresets.map((style) => (
        <Card
          key={style.id}
          className={`style-preset-card border-2 ${
            selectedStyle === style.id
              ? "selected border-primary"
              : "border-border/50"
          }`}
          onClick={() => onStyleSelect(style.id)}
        >
          <CardContent className="p-4">
            <h4 className="font-semibold mb-1">{style.name}</h4>
            <p className="text-xs text-muted-foreground">{style.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
