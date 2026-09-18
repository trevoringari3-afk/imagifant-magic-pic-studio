import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";

interface ShowcaseItem {
  url: string;
  prompt: string;
}

export const ShowcaseWall = () => {
  const [items, setItems] = useState<ShowcaseItem[]>([]);

  useEffect(() => {
    supabase
      .from("generations")
      .select("prompt, image_urls, created_at")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(24)
      .then(({ data }) => {
        const flat: ShowcaseItem[] = [];
        (data || []).forEach((g: any) => {
          (g.image_urls || []).forEach((url: string) => flat.push({ url, prompt: g.prompt }));
        });
        setItems(flat.slice(0, 18));
      });
  }, []);

  if (items.length === 0) return null;

  const track = [...items, ...items];

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 mb-8 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-xs sm:text-sm text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          Fresh from the community
        </span>
        <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold">
          Made with <span className="gradient-text">imagifant</span>
        </h2>
      </div>

      <div className="marquee-mask overflow-hidden">
        <div className="marquee-track flex gap-4 w-max">
          {track.map((item, i) => (
            <figure
              key={i}
              className="relative w-48 sm:w-64 aspect-square rounded-2xl overflow-hidden border border-border/60 shrink-0 group"
            >
              <img
                src={item.url}
                alt={item.prompt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-3 text-xs text-primary-foreground bg-gradient-to-t from-background/95 to-transparent opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
                <span className="text-foreground">{item.prompt}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};
