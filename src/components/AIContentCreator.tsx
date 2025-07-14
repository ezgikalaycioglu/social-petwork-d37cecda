import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Wand2, Copy, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIContentCreatorProps {
  petId: string;
  petName: string;
  imageLabels?: string[];
  onCaptionGenerated?: (caption: string) => void;
}

export const AIContentCreator = ({ 
  petId, 
  petName, 
  imageLabels, 
  onCaptionGenerated 
}: AIContentCreatorProps) => {
  const [caption, setCaption] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateCaption = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-creator', {
        body: { 
          petId,
          imageLabels,
          customPrompt: customPrompt.trim() || undefined
        }
      });

      if (error) {
        throw error;
      }

      setCaption(data.caption);
      onCaptionGenerated?.(data.caption);
      
      toast({
        title: "Caption generated!",
        description: `Pet Pal created a fun caption for ${petName}`,
      });
    } catch (error) {
      console.error('Error generating caption:', error);
      toast({
        title: "Error",
        description: "Failed to generate caption. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      toast({
        title: "Copied!",
        description: "Caption copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy caption",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          <CardTitle>AI Content Creator</CardTitle>
        </div>
        <CardDescription>
          Generate fun captions from {petName}'s perspective
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {imageLabels && imageLabels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="text-sm text-muted-foreground">Detected:</span>
            {imageLabels.map((label, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {label}
              </Badge>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Custom prompt (optional)</label>
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., 'playing in the park', 'napping after lunch', 'being mischievous'..."
            className="min-h-[60px]"
          />
        </div>

        {caption && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary">
                🐾 {petName}'s Caption
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm leading-relaxed">{caption}</p>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            onClick={generateCaption} 
            disabled={isLoading}
            className="flex-1"
            variant="default"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Caption
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};