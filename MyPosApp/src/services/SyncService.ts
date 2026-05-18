import { useSyncQueueStore } from '../store/useSyncQueueStore';
import { useNetworkStore } from '../store/useNetworkStore';

interface ApiResponse {
    success: boolean;
}

// This is a mock API call. Replace with your actual API endpoint.
const fakeApiCall = (actionType: string, payload: any): Promise<ApiResponse> => {
    console.log(`[SyncService] Syncing action: ${actionType}`, payload);
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
};

export const SyncService = {
    
    init: () => {
        const { isOnline } = useNetworkStore.getState();
        if (isOnline) {
            SyncService.processQueue();
        }

        // Subscribe to network changes correctly
        useNetworkStore.subscribe((state, prevState) => {
            if (state.isOnline && !prevState.isOnline) {
                console.log('[SyncService] Internet connection restored. Processing queue...');
                SyncService.processQueue();
            }
        });
    },

    processQueue: async () => {
        const { queue, removeFomQueue } = useSyncQueueStore.getState();
        if (queue.length === 0) {
            return;
        }

        console.log(`[SyncService] Starting to process ${queue.length} items.`);

        for (const action of queue) {
            try {
                const response = await fakeApiCall(action.type, action.payload);

                if (response.success) {
                    removeFomQueue(action.id);
                    console.log(`[SyncService] Action ${action.id} (${action.type}) synced successfully.`);
                } else {
                    console.warn(`[SyncService] Failed to sync action ${action.id}. Will retry later.`);
                    break; 
                }
            } catch (error) {
                console.error(`[SyncService] Error processing action ${action.id}:`, error);
                break;
            }
        }
    }
};
