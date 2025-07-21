import React from 'react';
import { Bell } from 'lucide-react';

const Notifications = () => {
  return (
    <div className="min-h-screen bg-background pt-16 pb-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        
        <div className="text-center text-muted-foreground py-12">
          <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No new notifications</p>
          <p className="text-sm">We'll notify you when something happens!</p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;