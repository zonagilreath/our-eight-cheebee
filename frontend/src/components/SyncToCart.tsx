import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useSharedList } from '../hooks/useSharedList';
import type { SessionStatus } from '../types';

export function SyncToCart() {
  const { uncheckedItems } = useSharedList();
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; added: number; errors: string[] } | null>(null);

  useEffect(() => {
    api.getSessionStatus().then(setSessionStatus).catch(() => {});
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const result = await api.syncToCart();
      setSyncResult(result);
    } catch (err) {
      setSyncResult({ success: false, added: 0, errors: [err instanceof Error ? err.message : 'Sync failed'] });
    } finally {
      setSyncing(false);
    }
  };

  const handleRefreshSession = async () => {
    try {
      await api.refreshSession();
      const status = await api.getSessionStatus();
      setSessionStatus(status);
    } catch {
      // Session refresh failed
    }
  };

  const itemsToSync = uncheckedItems.filter((i) => i.product_id);
  const unresolvedItems = uncheckedItems.filter((i) => !i.product_id);

  return (
    <div className="px-4 py-6">
      <h2 className="text-lg font-semibold text-8cb-text mb-4">Sync to 8-C-B Cart</h2>

      {/* Session Status */}
      <div className="bg-white rounded-lg border border-8cb-border p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-8cb-text">8-C-B Session</p>
            <p className="text-xs text-8cb-text-secondary mt-0.5">
              {sessionStatus
                ? sessionStatus.is_authenticated
                  ? 'Connected'
                  : 'Not connected'
                : 'Checking...'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                sessionStatus?.is_authenticated ? 'bg-8cb-green' : 'bg-8cb-text-secondary/30'
              }`}
            />
            {sessionStatus && !sessionStatus.is_authenticated && (
              <button
                onClick={handleRefreshSession}
                className="text-xs text-8cb-red font-medium"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Items Summary */}
      <div className="bg-white rounded-lg border border-8cb-border p-4 mb-4">
        <p className="text-sm font-medium text-8cb-text mb-2">Items to sync</p>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-8cb-text-secondary">Ready to add</span>
            <span className="font-medium text-8cb-text">{itemsToSync.length}</span>
          </div>
          {unresolvedItems.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-8cb-yellow">Needs product match</span>
              <span className="font-medium text-8cb-yellow">{unresolvedItems.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sync Button */}
      <button
        onClick={handleSync}
        disabled={syncing || itemsToSync.length === 0}
        className="w-full py-3.5 rounded-lg bg-8cb-red text-white font-semibold text-base disabled:opacity-40 hover:bg-8cb-red-dark active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        {syncing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Push {itemsToSync.length} item{itemsToSync.length !== 1 ? 's' : ''} to 8-C-B Cart
          </>
        )}
      </button>

      {/* Sync Result */}
      {syncResult && (
        <div className={`mt-4 rounded-lg p-4 ${syncResult.success ? 'bg-green-50 border border-green-200' : 'bg-8cb-red-light border border-8cb-red/20'}`}>
          <p className={`text-sm font-medium ${syncResult.success ? 'text-8cb-green' : 'text-8cb-red'}`}>
            {syncResult.success ? `Added ${syncResult.added} items to your 8-C-B cart` : 'Sync failed'}
          </p>
          {syncResult.errors.length > 0 && (
            <ul className="mt-2 space-y-1">
              {syncResult.errors.map((err, i) => (
                <li key={i} className="text-xs text-8cb-red">{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-8cb-text-secondary/60 text-center mt-4">
        After syncing, open the 8-C-B app to complete checkout
      </p>
    </div>
  );
}
