import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Generate = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [numberOfImages, setNumberOfImages] = useState("1");
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setLoading(true);
    setGeneratedImages([]);

    try {
      const numImages = parseInt(numberOfImages);
      const newImages: string[] = [];

      // Generate images sequentially
      for (let i = 0; i < numImages; i++) {
        const { data, error } = await supabase.functions.invoke("generate-image", {
          body: { prompt },
        });

        if (error) throw error;

        if (data?.image) {
          newImages.push(data.image);
          setGeneratedImages([...newImages]); // Update UI as each image comes in
        }
      }

      toast.success(`Generated ${numImages} image${numImages > 1 ? 's' : ''} successfully!`);
    } catch (error: any) {
      console.error("Generation error:", error);
      if (error.message?.includes("429")) {
        toast.error("Rate limit exceeded. Please try again in a moment.");
      } else if (error.message?.includes("402")) {
        toast.error("Credits depleted. Please add credits to continue.");
      } else {
        toast.error("Failed to generate image. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-32">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold">
              Generate Your{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Vision
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Describe what you want to see, and watch AI bring it to life
            </p>
          </div>

          <Card className="glass-card border-primary/30">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="prompt" className="text-lg">Your Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g., A futuristic city at sunset with flying cars and neon lights..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-32 bg-background/50 border-border/50 text-base resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-lg">Number of Images</Label>
                <RadioGroup value={numberOfImages} onValueChange={setNumberOfImages}>
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num}>
                        <RadioGroupItem
                          value={num.toString()}
                          id={`images-${num}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`images-${num}`}
                          className="flex items-center justify-center rounded-xl border-2 border-muted bg-background/50 p-4 hover:bg-accent hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                        >
                          <span className="text-2xl font-semibold">{num}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full glow-button bg-primary hover:bg-primary/90 text-lg py-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Images
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {generatedImages.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-center">Your Creations</h2>
              <div className={`grid gap-6 ${
                generatedImages.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' :
                generatedImages.length === 2 ? 'grid-cols-2' :
                'grid-cols-2 md:grid-cols-3'
              }`}>
                {generatedImages.map((image, index) => (
                  <Card key={index} className="glass-card border-primary/30 overflow-hidden group">
                    <CardContent className="p-0">
                      <div className="relative aspect-square">
                        <img
                          src={image}
                          alt={`Generated ${index + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generate;
