
import React from 'react';
import { PawPrint } from 'lucide-react';

const DiscoverPetsEmpty = () => {
  return (
    <div className="max-w-md mx-auto my-4">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4">
        <div className="space-y-2 text-center">
          <PawPrint className="w-8 h-8 mx-auto mt-2 text-muted-foreground/70" />
          <h2 className="text-base font-semibold text-gray-900">No new pets found</h2>
          <p className="text-sm text-muted-foreground mt-1">Check back later for more furry friends.</p>
        </div>
      </div>
    </div>
  );
};

export default DiscoverPetsEmpty;
