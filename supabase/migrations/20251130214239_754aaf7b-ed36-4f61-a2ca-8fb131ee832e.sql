-- Add is_favorite column to generations table
ALTER TABLE public.generations 
ADD COLUMN is_favorite BOOLEAN DEFAULT false NOT NULL;

-- Create an index for faster filtering of favorites
CREATE INDEX idx_generations_user_favorite 
ON public.generations(user_id, is_favorite) 
WHERE is_favorite = true;