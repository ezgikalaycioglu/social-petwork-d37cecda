
import React from 'react';
import { PawPrint } from 'lucide-react';

const DiscoverPetsEmpty = () => {
  return (
    <div className="text-center py-12">
      <PawPrint className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">No new pets found!</h2>
      <p className="text-gray-600 mb-6">Check back later for more furry friends.</p>
    </div>
  );
};

export default DiscoverPetsEmpty;
