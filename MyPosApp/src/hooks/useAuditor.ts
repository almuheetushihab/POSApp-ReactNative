import { useAuditLogStore } from '../store/useAuditLogStore';
import { AuditActionType } from '../types/audit';

export const useAuditor = () => {
    const addLog = useAuditLogStore((state) => state.addLog);

    const record = (actionType: AuditActionType, details: string, entityId?: string) => {
        addLog(actionType, details, entityId);
    };

    return { record };
};
