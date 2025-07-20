import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import PackFeed from '@/components/pack/PackFeed';

const PackDetails = () => {
  const { packId } = useParams<{ packId: string }>();

  if (!packId) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-destructive">Pack not found</h1>
              <p className="text-muted-foreground mt-2">The pack you're looking for doesn't exist.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Pack Feed</h1>
            <p className="text-muted-foreground">
              Stay connected with your pack through polls, contests, and announcements
            </p>
          </div>

          <PackFeed packId={packId} />
        </div>
      </div>
    </Layout>
  );
};

export default PackDetails;