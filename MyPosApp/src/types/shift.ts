export interface CashDrawerInfo {
    startingCash: number;
    cashSales: number;
    cashRefunds: number;
    cashAdded: number; // e.g. Petty cash put into the drawer
    cashRemoved: number; // e.g. Paying a vendor from the till
    expectedEndingCash: number;
    actualEndingCash?: number;
    difference?: number;
}

export interface Shift {
    id: string;
    userId: string;
    userName: string;
    startTime: string;
    endTime?: string;
    drawerInfo: CashDrawerInfo;
    status: 'ACTIVE' | 'CLOSED';
    notes?: string;
}