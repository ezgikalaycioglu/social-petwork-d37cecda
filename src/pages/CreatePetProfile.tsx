
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import CreatePetProfileForm from '@/components/CreatePetProfileForm';
import { ArrowLeft } from 'lucide-react';

const CreatePetProfile = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mr-4 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>

          <CreatePetProfileForm />
        </div>
      </div>
    </Layout>
  );
};

export default CreatePetProfile;
