import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { StylePresets, stylePresets } from "@/components/StylePresets";

const Generate = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [numImages, setNumImages] = useState("1");
  const [selectedStyle, setSelectedStyle] = useState("none");
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
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
      const count = parseInt(numImages);
      const imageUrls: string[] = [];

      // Get style modifier
      const stylePreset = stylePresets.find(s => s.id === selectedStyle);
      const finalPrompt = stylePreset?.prompt 
        ? `${prompt}, ${stylePreset.prompt}`
        : prompt;

      for (let i = 0; i < count; i++) {
        const { data, error } = await supabase.functions.invoke("generate-image", {
          body: { prompt: finalPrompt },
        });

        if (error) throw error;

        if (data?.imageUrl) {
          imageUrls.push(data.imageUrl);
        }
      }

      // Save to database
      const { error: dbError } = await supabase
        .from("generations")
        .insert({
          user_id: userId,
          prompt: prompt,
          style: selectedStyle !== "none" ? selectedStyle : null,
          image_urls: imageUrls,
        });

      if (dbError) {
        console.error("Error saving to database:", dbError);
      }

      setGeneratedImages(imageUrls);
      toast.success(`Successfully generated ${imageUrls.length} image(s)!`);
    } catch (error: any) {
      console.error("Error generating images:", error);
      toast.error(error.message || "Failed to generate images");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 neon-text flex items-center justify-center gap-2">
              <Wand2 className="w-8 h-8" />
              Generate Images
            </h1>
            <p className="text-muted-foreground">
              Transform your ideas into stunning visuals
            </p>
          </div>

          <Card className="glass-card border-primary/30 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Image Prompt
              </CardTitle>
              <CardDescription>
                Describe the image you want to create
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prompt">Your Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="A majestic lion standing on a cliff at sunset..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] bg-background/50 border-border/50"
                />
              </div>

              <div className="space-y-3">
                <Label>Style Preset</Label>
                <StylePresets 
                  selectedStyle={selectedStyle}
                  onStyleSelect={setSelectedStyle}
                />
              </div>

              <div className="space-y-2">
                <Label>Number of Images</Label>
                <RadioGroup value={numImages} onValueChange={setNumImages}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="r1" />
                    <Label htmlFor="r1" className="cursor-pointer">1 image</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="r2" />
                    <Label htmlFor="r2" className="cursor-pointer">2 images</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4" id="r4" />
                    <Label htmlFor="r4" className="cursor-pointer">4 images</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full glow-button"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Images
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {generatedImages.length > 0 && (
            <Card className="glass-card border-primary/30 animate-slide-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Your Creations
                </CardTitle>
                <CardDescription>Click on any image to view full size</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedImages.map((url, index) => (
                    <div 
                      key={index} 
                      className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300"
                      onClick={() => window.open(url, "_blank")}
                    >
                      <img
                        src={url}
                        alt={`Generated ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <p className="text-white text-sm">View Full Size</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generate;
