import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';

const Header = ({ toggleSidebar, showSearch = false }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-8">
      <div className="flex items-center justify-between">
        <button onClick={toggleSidebar} className="lg:hidden">
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        
        {showSearch && (
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-4 ml-auto">
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;