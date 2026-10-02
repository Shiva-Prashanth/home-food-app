import { useState } from 'react';
import { User, Phone, Mail, MapPin, ChefHat, LogOut, CheckCircle, Edit3, XCircle } from 'lucide-react';

export default function Profile() {
  const [kitchenStatus, setKitchenStatus] = useState(localStorage.getItem('kitchenStatus') || 'open');

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-6">
        
        {/* Profile Info */}
        <div className="flex flex-col items-center border-b border-gray-100 pb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-inner mb-4">
            JC
          </div>
          <h2 className="text-xl font-bold text-gray-900">John Cook</h2>
          <p className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-1">
            <ChefHat className="w-4 h-4" /> Kitchen Master
          </p>
          
          <div className="w-full bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>john.cook@homeeats.com</span>
            </div>
          </div>
        </div>

        {/* Kitchen Info */}
        <div className="border-b border-gray-100 pb-6">
          <h3 className="text-sm font-bold tracking-wider uppercase text-gray-400 mb-4">Kitchen Details</h3>
          <div className="space-y-4 px-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-gray-400" /> Kitchen Name
              </span>
              <span className="text-sm font-bold text-gray-900">HomeEats Central</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" /> Location
              </span>
              <span className="text-sm font-bold text-gray-900">Hyderabad, TS</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${kitchenStatus === 'open' ? 'bg-green-500' : 'bg-red-500'}`} />
                Status
              </span>
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${kitchenStatus === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {kitchenStatus === 'open' ? 'Currently Open' : 'Currently Closed'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-bold py-3 rounded-xl">
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
          <button className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 transition-colors font-bold py-3 rounded-xl">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}
