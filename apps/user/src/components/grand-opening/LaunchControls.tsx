import React, { useState } from 'react';
import { RotateCcw, Sparkles, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { launchApi } from '../../lib/grand-opening/launchApi';

interface LaunchControlsProps {
  isAdmin?: boolean;
  onPreview?: () => void;
  onResetSuccess?: () => void;
}

export const LaunchControls: React.FC<LaunchControlsProps> = ({
  isAdmin = false,
  onPreview,
  onResetSuccess,
}) => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleReset = async () => {
    try {
      setIsResetting(true);
      const res = await launchApi.resetLaunch();
      if (res.success) {
        setNotification('Launch state has been reset to unlaunched.');
        setShowResetModal(false);
        if (onResetSuccess) onResetSuccess();
      } else {
        setNotification(`Reset failed: ${res.message}`);
      }
    } catch (e: any) {
      setNotification(`Error: ${e.message}`);
    } finally {
      setIsResetting(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  if (!isAdmin) return null;

  return (
    <>
      <div className="flex items-center gap-2">
        {onPreview && (
          <button
            onClick={onPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#D6B15B]/15 hover:bg-[#D6B15B]/25 text-[#F6D88B] border border-[#D6B15B]/30 transition-all cursor-pointer"
            title="Play the full Grand Opening film without altering launch status"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preview Grand Opening</span>
          </button>
        )}

        <button
          onClick={() => setShowResetModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-900/20 hover:bg-red-900/35 text-red-300 border border-red-500/30 transition-all cursor-pointer"
          title="Reset the launch state for rehearsal or re-demonstration"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Launch Event</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#06170E] border border-[#D6B15B]/40 rounded-2xl p-6 shadow-2xl text-left space-y-4">
            <button
              onClick={() => setShowResetModal(false)}
              className="absolute top-4 right-4 text-[#F7F1E3]/60 hover:text-[#F7F1E3]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 text-[#F6D88B]">
              <AlertTriangle className="w-6 h-6 text-[#F6D88B]" />
              <h3 className="text-lg font-serif font-semibold text-[#F7F1E3]">
                Reset Grand Opening Launch?
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-[#F7F1E3]/80 leading-relaxed">
              This will set <code className="text-[#F6D88B]">has_launched = false</code> in the database.
              Authorized administrators opening the portal will experience the full Grand Opening film again.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
              >
                {isResetting ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#0B2E1A] border border-[#D6B15B]/50 text-[#F6D88B] rounded-xl shadow-2xl text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}
    </>
  );
};
