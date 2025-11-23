import { useEffect } from 'react';

export function SuccessBanner({ message, onClose, autoRedirect = false, redirectDelay = 3000 }) {
  useEffect(() => {
    if (autoRedirect) {
      const timer = setTimeout(() => {
        onClose();
      }, redirectDelay);
      return () => clearTimeout(timer);
    }
  }, [autoRedirect, redirectDelay, onClose]);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 animate-slide-down">
      <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-green-800">Success!</h3>
              <p className="text-sm text-green-700">{message}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-green-500 hover:text-green-700 ml-4 flex-shrink-0"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {autoRedirect && (
          <div className="mt-3">
            <div className="w-full bg-green-200 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-green-500 h-1 rounded-full transition-all" 
                style={{ 
                  animation: `progress ${redirectDelay}ms linear`,
                  width: '100%'
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ErrorBanner({ message, onClose }) {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 animate-slide-down">
      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-800">Error</h3>
              <p className="text-sm text-red-700">{message}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 ml-4 flex-shrink-0"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}