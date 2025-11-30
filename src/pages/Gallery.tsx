import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Sparkles, Download, Edit, Archive } from "lucide-react";
import { toast } from "sonner";
import { ImageEditor } from "@/components/ImageEditor";
import JSZip from "jszip";

interface Generation {
  id: string;
  prompt: string;
  style: string | null;
  image_urls: string[];
  created_at: string;
}

const Gallery = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [editingImage, setEditingImage] = useState<string | null>(null);

  useEffect(() => {
    loadGenerations();
  }, []);

  const loadGenerations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("generations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setGenerations(data || []);
    } catch (error: any) {
      toast.error("Error loading gallery");
      console.error("Error loading generations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string, generationId: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `imagifant-${generationId}-${index + 1}.png`;
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

  const handleBatchDownload = async (generation: Generation) => {
    const toastId = toast.loading(`Preparing ZIP file with ${generation.image_urls.length} images...`);
    
    try {
      const zip = new JSZip();
      const folder = zip.folder(`imagifant-${generation.id}`);
      
      if (!folder) {
        throw new Error("Failed to create ZIP folder");
      }

      // Download all images and add to ZIP
      const downloadPromises = generation.image_urls.map(async (url, index) => {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const fileName = `image-${index + 1}.png`;
          folder.file(fileName, blob);
          return true;
        } catch (error) {
          console.error(`Failed to download image ${index + 1}:`, error);
          return false;
        }
      });

      await Promise.all(downloadPromises);

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      // Download ZIP
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `imagifant-${generation.id}-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Successfully downloaded ${generation.image_urls.length} images as ZIP!`, { id: toastId });
    } catch (error) {
      console.error("Batch download error:", error);
      toast.error("Failed to create ZIP file", { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 neon-text">Your Gallery</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View all your generated masterpieces
          </p>
        </div>

        {generations.length === 0 ? (
          <Card className="glass-card border-primary/30 text-center py-12">
            <CardContent>
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No generations yet</h3>
              <p className="text-muted-foreground mb-4">
                Start creating amazing images to see them here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {generations.map((generation) => (
              <Card
                key={generation.id}
                className="glass-card border-primary/30 overflow-hidden hover:border-primary/50 transition-colors animate-slide-in"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
                    <div className="flex-1 w-full">
                      <p className="text-base sm:text-lg font-medium mb-2 break-words">{generation.prompt}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          {new Date(generation.created_at).toLocaleDateString()}
                        </span>
                        {generation.style && (
                          <Badge variant="secondary" className="capitalize text-xs">
                            {generation.style}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBatchDownload(generation)}
                      className="shrink-0"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Download All ({generation.image_urls.length})
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {generation.image_urls.map((url, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden group hover:shadow-lg transition-shadow"
                      >
                        <img
                          src={url}
                          alt={`Generated image ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                            console.error("Failed to load image:", url);
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-3 gap-2">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingImage(url);
                              }}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(url, generation.id, index);
                              }}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ImageEditor
        imageUrl={editingImage || ""}
        isOpen={!!editingImage}
        onClose={() => setEditingImage(null)}
      />
    </div>
  );
};

export default Gallery;
