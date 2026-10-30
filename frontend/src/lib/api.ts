const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    let errorMsg = `Server xatosi: ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData.message) {
        errorMsg = Array.isArray(errData.message)
          ? errData.message.join(', ')
          : errData.message;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Mahsulotlar
  getProducts: () => fetcher<any[]>('/products'),
  getProduct: (id: string) => fetcher<any>(`/products/${id}`),
  createProduct: (data: any) =>
    fetcher<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) =>
    fetcher<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) =>
    fetcher<any>(`/products/${id}`, { method: 'DELETE' }),

  // Omborlar
  getWarehouses: () => fetcher<any[]>('/warehouses'),
  createWarehouse: (data: any) =>
    fetcher<any>('/warehouses', { method: 'POST', body: JSON.stringify(data) }),
  getSubWarehouses: () => fetcher<any[]>('/sub-warehouses'),
  createSubWarehouse: (data: any) =>
    fetcher<any>('/sub-warehouses', { method: 'POST', body: JSON.stringify(data) }),
  getSubWarehouseStock: (id: string) => fetcher<any>(`/sub-warehouses/${id}/stock`),

  // Xaridlar
  getPurchases: () => fetcher<any[]>('/purchases'),
  getPurchase: (id: string) => fetcher<any>(`/purchases/${id}`),
  createPurchase: (data: any) =>
    fetcher<any>('/purchases', { method: 'POST', body: JSON.stringify(data) }),
  completePurchase: (id: string) =>
    fetcher<any>(`/purchases/${id}/complete`, { method: 'POST' }),

  // Savdolar
  getSales: () => fetcher<any[]>('/sales'),
  getSale: (id: string) => fetcher<any>(`/sales/${id}`),
  createSale: (data: any) =>
    fetcher<any>('/sales', { method: 'POST', body: JSON.stringify(data) }),
  completeSale: (id: string) =>
    fetcher<any>(`/sales/${id}/complete`, { method: 'POST' }),

  // Inventarizatsiya
  getInventoryAudits: () => fetcher<any[]>('/inventory'),
  getInventoryAudit: (id: string) => fetcher<any>(`/inventory/${id}`),
  createInventoryAudit: (data: any) =>
    fetcher<any>('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  completeInventoryAudit: (id: string) =>
    fetcher<any>(`/inventory/${id}/complete`, { method: 'POST' }),

  // Kassa
  getCashRegisters: () => fetcher<{ registers: any[]; totalBalance: number }>('/cashbox/registers'),
  createCashRegister: (data: any) =>
    fetcher<any>('/cashbox/registers', { method: 'POST', body: JSON.stringify(data) }),
  getCashTransactions: () => fetcher<any[]>('/cashbox/transactions'),
  createCashTransaction: (data: any) =>
    fetcher<any>('/cashbox/transactions', { method: 'POST', body: JSON.stringify(data) }),
  getCounterparties: () =>
    fetcher<{ counterparties: any[]; totalReceivable: number; totalPayable: number }>(
      '/cashbox/counterparties',
    ),

  // Hisobotlar
  getStockReport: () => fetcher<any>('/reports/stock'),
  getSalesReport: (startDate?: string, endDate?: string) => {
    const q = new URLSearchParams();
    if (startDate) q.append('startDate', startDate);
    if (endDate) q.append('endDate', endDate);
    return fetcher<any>(`/reports/sales?${q.toString()}`);
  },
  getPnlReport: (startDate?: string, endDate?: string) => {
    const q = new URLSearchParams();
    if (startDate) q.append('startDate', startDate);
    if (endDate) q.append('endDate', endDate);
    return fetcher<any>(`/reports/pnl?${q.toString()}`);
  },
};

