import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";
import ReportAbuseModal from "./ReportAbuseModal";

interface ReportAbuseButtonProps {
  contentType: 'tweet' | 'pet_profile' | 'user';
  contentId?: string;
  userDisplayName?: string;
  petName?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const ReportAbuseButton = ({
  contentType,
  contentId,
  userDisplayName,
  petName,
  variant = 'ghost',
  size = 'sm',
  className
}: ReportAbuseButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={className}
      >
        <Flag className="h-4 w-4 mr-1" />
        Report
      </Button>

      <ReportAbuseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contentType={contentType}
        contentId={contentId}
        prefilledUserName={userDisplayName}
        prefilledPetName={petName}
      />
    </>
  );
};

export default ReportAbuseButton;