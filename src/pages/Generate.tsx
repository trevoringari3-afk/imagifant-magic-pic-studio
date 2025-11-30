import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Loader2, Sparkles, Wand2, Download, Edit } from "lucide-react";
import { StylePresets, stylePresets } from "@/components/StylePresets";
import { ImageEditor } from "@/components/ImageEditor";

const Generate = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [numImages, setNumImages] = useState("1");
  const [selectedStyle, setSelectedStyle] = useState("none");
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [userId, setUserId] = useState("");
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [editingImage, setEditingImage] = useState<string | null>(null);

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
    setCurrentProgress(0);
    setCurrentImageIndex(0);

    try {
      const count = parseInt(numImages);
      const imageUrls: string[] = [];

      // Get style modifier
      const stylePreset = stylePresets.find(s => s.id === selectedStyle);
      const finalPrompt = stylePreset?.prompt 
        ? `${prompt}, ${stylePreset.prompt}`
        : prompt;

      for (let i = 0; i < count; i++) {
        setCurrentImageIndex(i + 1);
        setCurrentProgress(((i) / count) * 100);
        console.log(`Generating image ${i + 1} of ${count}...`);
        
        const { data, error } = await supabase.functions.invoke("generate-image", {
          body: { prompt: finalPrompt },
        });

        if (error) {
          console.error(`Error generating image ${i + 1}:`, error);
          throw error;
        }

        if (data?.image) {
          console.log(`Image ${i + 1} generated successfully`);
          imageUrls.push(data.image);
          setCurrentProgress(((i + 1) / count) * 100);
        } else {
          console.error(`No image returned for generation ${i + 1}`, data);
          throw new Error(`Failed to generate image ${i + 1}`);
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
      setCurrentProgress(0);
      setCurrentImageIndex(0);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `imagifant-${Date.now()}-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 neon-text flex items-center justify-center gap-2">
              <Wand2 className="w-6 h-6 sm:w-8 sm:h-8" />
              Generate Images
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="prompt">Your Prompt</Label>
                  <span className="text-xs text-muted-foreground">
                    {prompt.length}/1000 characters
                  </span>
                </div>
                <Textarea
                  id="prompt"
                  placeholder="A majestic lion standing on a cliff at sunset..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] md:min-h-[140px] bg-background/50 border-border/50 resize-none"
                  maxLength={1000}
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

              {loading && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Generating image {currentImageIndex} of {numImages}...
                    </span>
                    <span className="font-medium">{Math.round(currentProgress)}%</span>
                  </div>
                  <Progress value={currentProgress} className="h-2" />
                </div>
              )}

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
                      className="relative aspect-square rounded-lg overflow-hidden group hover:shadow-xl transition-all duration-300"
                    >
                      <img
                        src={url}
                        alt={`Generated ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          console.error("Failed to load generated image:", url);
                          toast.error(`Failed to load image ${index + 1}`);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-4 gap-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingImage(url);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(url, index);
                            }}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ImageEditor
        imageUrl={editingImage || ""}
        isOpen={!!editingImage}
        onClose={() => setEditingImage(null)}
      />
    </div>
  );
};

export default Generate;
