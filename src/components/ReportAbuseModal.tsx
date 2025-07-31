import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, Flag } from "lucide-react";

interface ReportAbuseModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType?: 'tweet' | 'pet_profile' | 'user';
  contentId?: string;
  prefilledUserName?: string;
  prefilledPetName?: string;
}

const abuseTypes = [
  "Spam",
  "Harassment",
  "Hate Speech",
  "Child Abuse",
  "Violence or Threats",
  "Inappropriate Content",
  "Impersonation",
  "Intellectual Property Violation",
  "Privacy Violation",
  "Other"
];

export const ReportAbuseModal = ({
  isOpen,
  onClose,
  contentType = 'user',
  contentId,
  prefilledUserName = '',
  prefilledPetName = ''
}: ReportAbuseModalProps) => {
  const { user } = useAuth();
  const [selectedAbuseType, setSelectedAbuseType] = useState('');
  const [description, setDescription] = useState('');
  const [reportedUserName, setReportedUserName] = useState(prefilledUserName);
  const [reportedPetName, setReportedPetName] = useState(prefilledPetName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to report abuse.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAbuseType) {
      toast({
        title: "Required Field",
        description: "Please select the type of abuse.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('submit-abuse-report', {
        body: {
          reportedContentType: contentType,
          reportedContentId: contentId,
          reportedUserName: reportedUserName || undefined,
          reportedPetName: reportedPetName || undefined,
          abuseType: selectedAbuseType,
          description: description || undefined,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Report Submitted",
        description: "Thank you for your report. Our moderation team will review it promptly.",
      });

      // Reset form
      setSelectedAbuseType('');
      setDescription('');
      setReportedUserName('');
      setReportedPetName('');
      onClose();
    } catch (error: any) {
      console.error('Error submitting abuse report:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Report Abuse
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your report will be examined, and if necessary, content will be removed, 
              and the user may be suspended or reported to authorities.
            </AlertDescription>
          </Alert>

          {/* Show manual input fields only when not reporting specific content */}
          {!contentId && (
            <div className="space-y-4">
              {contentType === 'user' && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username or Email</Label>
                  <Input
                    id="username"
                    value={reportedUserName}
                    onChange={(e) => setReportedUserName(e.target.value)}
                    placeholder="Enter the username or email to report"
                    required={!reportedPetName}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="petname">Pet Name (if reporting a pet)</Label>
                <Input
                  id="petname"
                  value={reportedPetName}
                  onChange={(e) => setReportedPetName(e.target.value)}
                  placeholder="Enter the pet's name to report (optional)"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="abuse-type">Type of Abuse</Label>
            <Select value={selectedAbuseType} onValueChange={setSelectedAbuseType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select the type of abuse" />
              </SelectTrigger>
              <SelectContent>
                {abuseTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Details</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide any additional details about the incident..."
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedAbuseType} 
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportAbuseModal;