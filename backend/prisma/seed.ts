import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Ma\'lumotlar bazasini tozalash va to\'ldirish (Seeding) boshlandi ---');

  // 1. Kassalarni yaratish
  const cashRegister = await prisma.cashRegister.upsert({
    where: { id: 'cash-main' },
    update: {},
    create: {
      id: 'cash-main',
      name: 'Asosiy Naqd Kassa',
      balance: 5000000, // 5,000,000 so'm
      isDefault: true,
    },
  });

  const cardRegister = await prisma.cashRegister.upsert({
    where: { id: 'cash-card' },
    update: {},
    create: {
      id: 'cash-card',
      name: 'Terminal / Humo-Uzcard',
      balance: 2000000, // 2,000,000 so'm
      isDefault: false,
    },
  });

  // 2. Ombor va Sub-omborlarni yaratish
  const mainWarehouse = await prisma.warehouse.upsert({
    where: { id: 'wh-main' },
    update: {},
    create: {
      id: 'wh-main',
      name: 'Markaziy Do\'kon Ombori',
      address: 'Toshkent sh., Chilonzor tumani',
      isDefault: true,
    },
  });

  const subFridge1 = await prisma.subWarehouse.upsert({
    where: { id: 'sub-fridge-1' },
    update: {},
    create: {
      id: 'sub-fridge-1',
      warehouseId: mainWarehouse.id,
      name: '1-Sovutgich (Ichki)',
      description: 'Sovutiladigan gazlangan ichimliklar uchun',
    },
  });

  const subVitrina = await prisma.subWarehouse.upsert({
    where: { id: 'sub-vitrina' },
    update: {},
    create: {
      id: 'sub-vitrina',
      warehouseId: mainWarehouse.id,
      name: 'Do\'kon Zali (Vitrina)',
      description: 'Xaridorlar to\'g\'ridan-to\'g\'ri oladigan javonlar',
    },
  });

  const subAngar = await prisma.subWarehouse.upsert({
    where: { id: 'sub-angar' },
    update: {},
    create: {
      id: 'sub-angar',
      warehouseId: mainWarehouse.id,
      name: 'Zaxira Angar (Zaxira bloklar)',
      description: 'Yetkazib beruvchidan tushirilgan asosiy bloklar',
    },
  });

  // 3. Ichimliklar (Mahsulotlar)
  const productsData = [
    {
      id: 'prod-cola-05',
      name: 'Coca-Cola Classic 0.5L',
      category: 'Gazlangan ichimliklar',
      barcode: '5449000000996',
      pcsPerPack: 12, // 1 blok = 12 dona
      costPrice: 5500,
      sellPriceUnit: 7000,
      sellPricePack: 78000,
      minStockAlert: 24,
    },
    {
      id: 'prod-cola-15',
      name: 'Coca-Cola Classic 1.5L',
      category: 'Gazlangan ichimliklar',
      barcode: '5449000011527',
      pcsPerPack: 6, // 1 blok = 6 dona
      costPrice: 10000,
      sellPriceUnit: 13000,
      sellPricePack: 72000,
      minStockAlert: 18,
    },
    {
      id: 'prod-fanta-05',
      name: 'Fanta Apelsin 0.5L',
      category: 'Gazlangan ichimliklar',
      barcode: '5449000011234',
      pcsPerPack: 12,
      costPrice: 5500,
      sellPriceUnit: 7000,
      sellPricePack: 78000,
      minStockAlert: 24,
    },
    {
      id: 'prod-pepsi-05',
      name: 'Pepsi 0.5L',
      category: 'Gazlangan ichimliklar',
      barcode: '4820000010012',
      pcsPerPack: 12,
      costPrice: 5200,
      sellPriceUnit: 6500,
      sellPricePack: 72000,
      minStockAlert: 24,
    },
    {
      id: 'prod-chortoq-05',
      name: 'Chortoq Mineral Suv 0.5L (Shisha)',
      category: 'Mineral suvlar',
      barcode: '4780012345678',
      pcsPerPack: 12,
      costPrice: 4000,
      sellPriceUnit: 5500,
      sellPricePack: 60000,
      minStockAlert: 24,
    },
    {
      id: 'prod-hydro-10',
      name: 'Hydrolife Gazsiz Suv 1.0L',
      category: 'Ichimlik suvlari',
      barcode: '4780087654321',
      pcsPerPack: 6,
      costPrice: 3000,
      sellPriceUnit: 4500,
      sellPricePack: 24000,
      minStockAlert: 30,
    },
    {
      id: 'prod-flash-045',
      name: 'Flash Up Energy 0.45L',
      category: 'Energetik ichimliklar',
      barcode: '4607065000012',
      pcsPerPack: 12,
      costPrice: 6500,
      sellPriceUnit: 8500,
      sellPricePack: 95000,
      minStockAlert: 24,
    },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  // 4. Sub-omborlarga dastlabki qoldiqlarni joylashtirish
  // Coca-Cola 0.5L:
  // - 1-Sovutgichda: 48 dona = 4 blok
  // - Vitrinada: 15 dona = 1 blok + 3 dona
  // - Angarda: 180 dona = 15 blok
  await prisma.stockItem.upsert({
    where: { productId_subWarehouseId: { productId: 'prod-cola-05', subWarehouseId: subFridge1.id } },
    update: {},
    create: { productId: 'prod-cola-05', subWarehouseId: subFridge1.id, quantityInUnits: 48 },
  });
  await prisma.stockItem.upsert({
    where: { productId_subWarehouseId: { productId: 'prod-cola-05', subWarehouseId: subVitrina.id } },
    update: {},
    create: { productId: 'prod-cola-05', subWarehouseId: subVitrina.id, quantityInUnits: 15 },
  });
  await prisma.stockItem.upsert({
    where: { productId_subWarehouseId: { productId: 'prod-cola-05', subWarehouseId: subAngar.id } },
    update: {},
    create: { productId: 'prod-cola-05', subWarehouseId: subAngar.id, quantityInUnits: 180 },
  });

  // Coca-Cola 1.5L:
  // - Vitrinada: 8 dona = 1 blok + 2 dona (1 blok = 6)
  // - Angarda: 60 dona = 10 blok
  await prisma.stockItem.upsert({
    where: { productId_subWarehouseId: { productId: 'prod-cola-15', subWarehouseId: subVitrina.id } },
    update: {},
    create: { productId: 'prod-cola-15', subWarehouseId: subVitrina.id, quantityInUnits: 8 },
  });
  await prisma.stockItem.upsert({
    where: { productId_subWarehouseId: { productId: 'prod-cola-15', subWarehouseId: subAngar.id } },
    update: {},
    create: { productId: 'prod-cola-15', subWarehouseId: subAngar.id, quantityInUnits: 60 },
  });

  // Fanta 0.5L:
  // - 1-Sovutgichda: 24 dona = 2 blok
  // - Angarda: 72 dona = 6 blok
  await prisma.stockItem.upsert({
    where: { productId_subWarehouseId: { productId: 'prod-fanta-05', subWarehouseId: subFridge1.id } },
    update: {},
    create: { productId: 'prod-fanta-05', subWarehouseId: subFridge1.id, quantityInUnits: 24 },
  });
  await prisma.stockItem.upsert({
    where: { productId_subWarehouseId: { productId: 'prod-fanta-05', subWarehouseId: subAngar.id } },
    update: {},
    create: { productId: 'prod-fanta-05', subWarehouseId: subAngar.id, quantityInUnits: 72 },
  });

  // Flash Up Energy:
  // - 1-Sovutgichda: 36 dona = 3 blok
  await prisma.stockItem.upsert({
    where: { productId_subWarehouseId: { productId: 'prod-flash-045', subWarehouseId: subFridge1.id } },
    update: {},
    create: { productId: 'prod-flash-045', subWarehouseId: subFridge1.id, quantityInUnits: 36 },
  });

  // 5. Hamkorlar (Kontragentlar)
  await prisma.counterparty.upsert({
    where: { id: 'cp-coca-cola' },
    update: {},
    create: {
      id: 'cp-coca-cola',
      name: 'Coca-Cola Bottlers Uzbekistan MCHJ',
      phone: '+998 71 200 00 00',
      type: 'SUPPLIER',
      balance: 0,
    },
  });

  await prisma.counterparty.upsert({
    where: { id: 'cp-aziz-kafe' },
    update: {},
    create: {
      id: 'cp-aziz-kafe',
      name: 'Azizbek Kafe (Doimiy mijoz)',
      phone: '+998 90 123 45 67',
      type: 'CUSTOMER',
      balance: 0,
    },
  });

  console.log('--- Ma\'lumotlar muvaffaqiyatli yuklandi (Seed yakunlandi) ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

