import React, { useState } from 'react';
import { FileText, CheckCircle, XCircle, Download } from 'lucide-react';

const KYCVerification = () => {
  const kycRequests = [
    {
      id: 1,
      user: 'John Doe',
      email: 'john@example.com',
      documentType: 'KTP',
      submitted: '2024-12-20',
      status: 'pending'
    },
    {
      id: 2,
      user: 'Jane Smith',
      email: 'jane@example.com',
      documentType: 'Passport',
      submitted: '2024-12-22',
      status: 'pending'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verifikasi Identitas (KYC)</h1>
        <p className="text-gray-600 mt-1">Review dan verifikasi dokumen identitas pengguna</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {kycRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{request.user}</h3>
                <p className="text-sm text-gray-600">{request.email}</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Document Type:</span>
                <span className="font-medium text-gray-900">{request.documentType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Submitted:</span>
                <span className="font-medium text-gray-900">{request.submitted}</span>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center h-40">
                <FileText className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">Document Preview</p>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KYCVerification;