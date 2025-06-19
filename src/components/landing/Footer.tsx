
import { Separator } from '@/components/ui/separator';
import { Heart, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">🐾</span>
              <h3 className="text-2xl font-bold">Social Petwork</h3>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Connecting pets and their families through meaningful social experiences, 
              adventures, and community support.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community Guidelines</a></li>
            </ul>
          </div>
        </div>
        
        <Separator className="bg-gray-700 mb-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 Social Petwork. All rights reserved.
          </p>
          <div className="flex items-center text-gray-400 text-sm">
            Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> for pets and their families
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
