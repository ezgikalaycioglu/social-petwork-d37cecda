
import React from 'react';
import { PawPrint } from 'lucide-react';

const DiscoverPetsLoading = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <PawPrint className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
        <p className="text-gray-600">Loading available pets...</p>
      </div>
    </div>
  );
};

export default DiscoverPetsLoading;
