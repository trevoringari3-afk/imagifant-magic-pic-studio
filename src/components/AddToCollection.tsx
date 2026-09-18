import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FolderPlus, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Collection {
  id: string;
  name: string;
}

interface AddToCollectionProps {
  generationId: string;
}

export const AddToCollection = ({ generationId }: AddToCollectionProps) => {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    supabase
      .from("collections")
      .select("id, name")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error("Could not load your collections");
        setCollections(data || []);
        setLoading(false);
      });
  }, [open]);

  const addTo = async (collectionId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("collection_items")
      .insert({ collection_id: collectionId, generation_id: generationId, user_id: user.id });

    if (error) {
      if (error.code === "23505") {
        toast.info("Already in that collection");
      } else {
        toast.error("Could not add to collection");
      }
      return;
    }
    toast.success("Added to collection");
    setOpen(false);
  };

  const createAndAdd = async () => {
    if (!newName.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("collections")
      .insert({ name: newName.trim(), user_id: user.id })
      .select("id")
      .single();

    if (error || !data) {
      toast.error("Could not create collection");
      return;
    }
    setNewName("");
    await addTo(data.id);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderPlus className="w-4 h-4 mr-2" />
          Collect
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle>Add to a collection</DialogTitle>
          <DialogDescription>Group your best creations into albums.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="New collection name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createAndAdd()}
            />
            <Button onClick={createAndAdd} disabled={!newName.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : collections.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No collections yet — create your first one above.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {collections.map((c) => (
                <button
                  key={c.id}
                  onClick={() => addTo(c.id)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-border/60 hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
