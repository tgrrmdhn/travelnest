import React, { useState } from 'react';
import { CheckCircle, XCircle, Calendar, Users, MessageSquare } from 'lucide-react';

const HostRequests = () => {
  const requests = [
    {
      id: 1,
      traveler: 'Jane Smith',
      checkIn: '2024-12-28',
      checkOut: '2024-12-30',
      guests: 2,
      message: 'Hi! We are a couple traveling to Jakarta for vacation.',
      status: 'pending',
      date: '2024-12-25'
    },
    {
      id: 2,
      traveler: 'Mike Johnson',
      checkIn: '2025-01-05',
      checkOut: '2025-01-07',
      guests: 1,
      message: 'Business trip to Jakarta. Looking for a quiet place.',
      status: 'pending',
      date: '2024-12-26'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Terima/Tolak Request</h1>
        <p className="text-gray-600 mt-1">Kelola permintaan menginap dari traveler</p>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{request.traveler}</h3>
                <p className="text-sm text-gray-600">Requested on {request.date}</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Check-in</p>
                  <p className="font-medium text-gray-900">{request.checkIn}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Check-out</p>
                  <p className="font-medium text-gray-900">{request.checkOut}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Guests</p>
                  <p className="font-medium text-gray-900">{request.guests}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Message</p>
                  <p className="text-sm text-gray-700">{request.message}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <CheckCircle className="w-4 h-4" />
                Accept
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HostRequests;
