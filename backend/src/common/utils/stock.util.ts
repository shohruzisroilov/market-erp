export interface StockBreakdown {
  totalUnits: number;
  packs: number;
  remainderUnits: number;
  displayText: string;
}

export function calculateStockBreakdown(
  quantityInUnits: number,
  pcsPerPack: number,
): StockBreakdown {
  const safePcs = Math.max(1, pcsPerPack || 1);
  const safeUnits = Math.max(0, quantityInUnits || 0);

  const packs = Math.floor(safeUnits / safePcs);
  const remainderUnits = safeUnits % safePcs;

  let displayText = '';
  if (packs > 0 && remainderUnits > 0) {
    displayText = `${packs} blok + ${remainderUnits} dona (${safeUnits} dona)`;
  } else if (packs > 0) {
    displayText = `${packs} blok (${safeUnits} dona)`;
  } else {
    displayText = `${safeUnits} dona`;
  }

  return {
    totalUnits: safeUnits,
    packs,
    remainderUnits,
    displayText,
  };
}

