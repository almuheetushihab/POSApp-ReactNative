export type AuditActionType = 
    // Product Actions
    | 'CREATE_PRODUCT'
    | 'UPDATE_PRODUCT'
    | 'DELETE_PRODUCT'
    // Order Actions
    | 'PROCESS_REFUND'
    | 'PROCESS_RETURN'
    | 'PROCESS_EXCHANGE'
    // Settings Actions
    | 'UPDATE_SHOP_INFO'
    | 'UPDATE_TAX_SETTINGS'
    // User/Auth Actions
    | 'USER_LOGIN'
    | 'USER_LOGOUT'
    // Shift Management
    | 'SHIFT_START'
    | 'SHIFT_END';

export interface AuditLogEntry {
    id: string;
    timestamp: number;
    userId: string;
    userName: string;
    actionType: AuditActionType;
    details: string; // e.g., "Updated price for 'Product X' from 100 to 110"
    entityId?: string; // e.g., Product ID, Order ID
}
