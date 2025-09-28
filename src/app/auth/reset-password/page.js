'use client';

import { Suspense } from 'react';
import PasswordResetForm from '@/components/auth/PasswordResetForm';

function ResetPasswordContent() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8" style={{backgroundColor: 'var(--alabaster)'}}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-8 px-4 shadow sm:rounded-lg sm:px-10" style={{backgroundColor: 'var(--timber)'}}>
          <PasswordResetForm />
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8" style={{backgroundColor: 'var(--alabaster)'}}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="py-8 px-4 shadow sm:rounded-lg sm:px-10" style={{backgroundColor: 'var(--timber)'}}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
