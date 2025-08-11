import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AICoachProps {
  petId: string;
  petName: string;
}

export const AICoach = ({ petId, petName }: AICoachProps) => {
  const [tip, setTip] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateTip = async () => {
    // Temporary placeholder until AI tips launch
    setIsLoading(true);
    try {
      setTip("Coming soon!");
      toast({
        title: "Coming soon!",
        description: "AI PawCoach tips will be available shortly.",
      });
    } catch (error) {
      console.error('Error generating tip:', error);
      toast({
        title: "Error",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>AI PawCoach</CardTitle>
        </div>
        <CardDescription>
          Get personalized nutrition tips for {petName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tip && (
          <div className="p-4 bg-muted rounded-lg">
            <Badge variant="secondary" className="mb-2">
              💡 Tip for {petName}
            </Badge>
            <p className="text-sm leading-relaxed">{tip}</p>
          </div>
        )}
        
        <Button 
          onClick={generateTip} 
          disabled={isLoading}
          className="w-full"
          variant="default"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating tip...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Get New Tip
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};