export interface Product {
  id: string;
  name: string;
  category: string;
  barcode?: string | null;
  pcsPerPack: number;
  costPrice: number;
  sellPriceUnit: number;
  sellPricePack: number;
  minStockAlert: number;
  totalUnits: number;
  packs: number;
  remainderUnits: number;
  displayText: string;
  isLowStock: boolean;
  subWarehouseStock?: {
    subWarehouseId: string;
    subWarehouseName: string;
    warehouseName: string;
    quantityInUnits: number;
    packs: number;
    remainderUnits: number;
    displayText: string;
  }[];
}

export interface SubWarehouse {
  id: string;
  warehouseId: string;
  name: string;
  description?: string | null;
  warehouse?: {
    id: string;
    name: string;
    address?: string | null;
  };
}

export interface Warehouse {
  id: string;
  name: string;
  address?: string | null;
  isDefault: boolean;
  subWarehouses: {
    id: string;
    name: string;
    description?: string | null;
    totalProductsCount: number;
    totalUnits: number;
  }[];
}

export interface PurchaseItem {
  id: string;
  productId: string;
  packQuantity: number;
  unitQuantity: number;
  totalUnits: number;
  unitCost: number;
  totalCost: number;
  packs?: number;
  remainderUnits?: number;
  displayText?: string;
  product: Product;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  subWarehouseId: string;
  status: 'DRAFT' | 'COMPLETED';
  totalAmount: number;
  paidAmount: number;
  debtAmount: number;
  note?: string | null;
  completedAt?: string | null;
  createdAt: string;
  subWarehouse: SubWarehouse;
  items: PurchaseItem[];
}

export interface SaleItem {
  id: string;
  productId: string;
  packQuantity: number;
  unitQuantity: number;
  totalUnits: number;
  unitPrice: number;
  totalAmount: number;
  unitCostAtSale: number;
  totalCostAtSale: number;
  packs?: number;
  remainderUnits?: number;
  displayText?: string;
  product: Product;
}

export interface SaleInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  subWarehouseId: string;
  status: 'DRAFT' | 'COMPLETED';
  totalAmount: number;
  paidAmount: number;
  debtAmount: number;
  paymentMethod: string;
  totalCostAmount: number;
  grossProfit: number;
  note?: string | null;
  completedAt?: string | null;
  createdAt: string;
  subWarehouse: SubWarehouse;
  items: SaleItem[];
}

export interface InventoryAuditItem {
  id: string;
  productId: string;
  systemQuantity: number;
  actualPacks: number;
  actualUnits: number;
  actualQuantity: number;
  differenceQuantity: number;
  unitCost: number;
  differenceValue: number;
  product: Product;
  systemBreakdown?: {
    packs: number;
    remainderUnits: number;
    displayText: string;
  };
  actualBreakdown?: {
    packs: number;
    remainderUnits: number;
    displayText: string;
  };
}

export interface InventoryAudit {
  id: string;
  auditNumber: string;
  subWarehouseId: string;
  status: 'DRAFT' | 'COMPLETED';
  totalDifferenceValue: number;
  note?: string | null;
  completedAt?: string | null;
  createdAt: string;
  subWarehouse: SubWarehouse;
  items: InventoryAuditItem[];
}

export interface CashRegister {
  id: string;
  name: string;
  balance: number;
  isDefault: boolean;
}

export interface CashTransaction {
  id: string;
  cashRegisterId: string;
  type: string;
  direction: 'IN' | 'OUT';
  amount: number;
  category: string;
  partyName?: string | null;
  relatedId?: string | null;
  note?: string | null;
  createdAt: string;
  cashRegister?: CashRegister;
}

export interface Counterparty {
  id: string;
  name: string;
  phone?: string | null;
  type: string;
  balance: number;
}

export interface PnlReport {
  period: {
    startDate: string;
    endDate: string;
  };
  pnl: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    grossMarginPercent: number;
    operatingExpenses: {
      transport: number;
      rent: number;
      salary: number;
      utilities: number;
      other: number;
      total: number;
    };
    inventoryAdjustments: {
      deficit: number;
      surplus: number;
      netImpact: number;
    };
    otherIncome: number;
    netProfit: number;
    netMarginPercent: number;
  };
  financingAndDebtFlow: {
    debtGiven: number;
    debtCollected: number;
    debtTaken: number;
    debtRepaid: number;
    explanation: string;
  };
}

