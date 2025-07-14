import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAI = () => {
  const [isGeneratingTip, setIsGeneratingTip] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const { toast } = useToast();

  const generateCoachTip = async (petId: string) => {
    setIsGeneratingTip(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: { petId }
      });

      if (error) {
        throw error;
      }

      return { tip: data.tip, id: data.id };
    } catch (error) {
      console.error('Error generating tip:', error);
      toast({
        title: "Error",
        description: "Failed to generate tip. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGeneratingTip(false);
    }
  };

  const generateContentCaption = async (
    petId: string, 
    imageLabels?: string[], 
    customPrompt?: string
  ) => {
    setIsGeneratingCaption(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-creator', {
        body: { 
          petId,
          imageLabels,
          customPrompt: customPrompt?.trim() || undefined
        }
      });

      if (error) {
        throw error;
      }

      return { caption: data.caption, id: data.id };
    } catch (error) {
      console.error('Error generating caption:', error);
      toast({
        title: "Error",
        description: "Failed to generate caption. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const getAIHistory = async (contentType?: 'coach_tip' | 'caption') => {
    try {
      let query = supabase
        .from('ai_generated_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (contentType) {
        query = query.eq('content_type', contentType);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching AI history:', error);
      toast({
        title: "Error",
        description: "Failed to load AI history.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    generateCoachTip,
    generateContentCaption,
    getAIHistory,
    isGeneratingTip,
    isGeneratingCaption
  };
};