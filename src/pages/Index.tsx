import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Sparkles, Zap, Image, Rocket } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-slide-in">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-sm text-primary">
                Powered by Advanced AI
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              Transform Your{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-glow-pulse">
                Imagination
              </span>
              {" "}Into Reality
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create stunning AI-generated images with simple text prompts. 
              Experience the future of digital creativity with NeuralForge.
            </p>
            
            <div className="flex gap-4 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="glow-button bg-primary hover:bg-primary/90 text-lg px-8 py-6"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Creating
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/30 hover:border-primary text-lg px-8 py-6"
              >
                View Examples
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl space-y-4 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Generate high-quality images in seconds with our optimized AI models
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl space-y-4 hover:border-secondary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Image className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-2xl font-semibold">Unlimited Creativity</h3>
              <p className="text-muted-foreground">
                Choose how many images to generate and explore endless possibilities
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl space-y-4 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">Easy to Use</h3>
              <p className="text-muted-foreground">
                Simple interface designed for creators of all skill levels
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="glass-card p-12 rounded-3xl text-center space-y-6 max-w-3xl mx-auto border-primary/30">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Create Magic?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of creators bringing their ideas to life
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="glow-button bg-primary hover:bg-primary/90 text-lg px-8 py-6"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
