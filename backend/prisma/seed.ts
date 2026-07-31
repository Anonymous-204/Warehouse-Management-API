import { PrismaClient, Role, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu dọn dẹp dữ liệu cũ...');

  // 1. CLEANUP DATA (Xóa dữ liệu cũ theo đúng thứ tự)
  await prisma.stockTransaction.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.warehouse.deleteMany();

  // Reset Auto-increment sequence trong PostgreSQL (Tách từng lệnh riêng biệt)
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE warehouses_id_seq RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE users_id_seq RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE categories_id_seq RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE brands_id_seq RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE suppliers_id_seq RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE products_id_seq RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE inventories_id_seq RESTART WITH 1;`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE stock_transactions_id_seq RESTART WITH 1;`);

  console.log('📦 Đang chèn Warehouses...');
  await prisma.warehouse.createMany({
    data: [
      { name: 'Kho Tổng Hà Nội', address: '123 Đường Cầu Giấy, Q. Cầu Giấy, Hà Nội', description: 'Kho tổng điều phối khu vực Phía Bắc' },
      { name: 'Kho Chi Nhánh Hải Phòng', address: '45 Đường Lê Hồng Phong, Ngô Quyền, Hải Phòng', description: 'Kho vận chuyển đường biển & logistics' },
      { name: 'Kho Tổng TP. Hồ Chí Minh', address: '789 Đường Lê Văn Việt, TP. Thủ Đức, TP.HCM', description: 'Kho tổng điều phối khu vực Phía Nam' },
      { name: 'Kho Chi Nhánh Đà Nẵng', address: '12 Đường Nguyễn Văn Linh, Hải Châu, Đà Nẵng', description: 'Kho trung chuyển khu vực Miền Trung' },
      { name: 'Kho Chi Nhánh Cần Thơ', address: '88 Đường 3/2, Ninh Kiều, Cần Thơ', description: 'Kho phân phối khu vực Miền Tây' },
    ],
  });

  console.log('👥 Đang chèn Users...');
  await prisma.user.createMany({
    data: [
      { email: 'admin.system@company.com', name: 'Admin System', hashedPassword: '$2b$10$UEtORWsEaZha2hdW6EkbgunvUBHpTduXsB044LRJomZ1fASzIIAh6', warehouseId: 1, role: Role.ADMIN },
      { email: 'manager.hanoi@company.com', name: 'Nguyễn Văn Hải (Manager HN)', hashedPassword: '$2b$10$EpR2C89.1234567890pwdHashManager', warehouseId: 1, role: Role.MANAGER },
      { email: 'staff.hn01@company.com', name: 'Trần Thị Mai', hashedPassword: '$2b$10$EpR2C89.1234567890pwdHashStaff', warehouseId: 1, role: Role.STAFF },
      { email: 'staff.hn02@company.com', name: 'Lê Hoàng Nam', hashedPassword: '$2b$10$EpR2C89.1234567890pwdHashStaff', warehouseId: 1, role: Role.STAFF },
      { email: 'manager.hp@company.com', name: 'Pham Đức Thắng (Manager HP)', hashedPassword: '$2b$10$EpR2C89.1234567890pwdHashManager', warehouseId: 2, role: Role.MANAGER },
      { email: 'staff.hp01@company.com', name: 'Vũ Thị Phương', hashedPassword: '$2b$10$EpR2C89.1234567890pwdHashStaff', warehouseId: 2, role: Role.STAFF },
      { email: 'manager.hcm@company.com', name: 'Hoàng Văn Thái (Manager HCM)', hashedPassword: '$2b$10$EpR2C89.1234567890pwdHashManager', warehouseId: 3, role: Role.MANAGER },
      { email: 'staff.hcm01@company.com', name: 'Đặng Ngọc Bích', hashedPassword: '$2b$10$EpR2C89.1234567890pwdHashStaff', warehouseId: 3, role: Role.STAFF },
      { email: 'staff.hcm02@company.com', name: 'Ngô Quốc Bảo', hashedPassword: '$2b$10$EpR2C89.1234567890pwdHashStaff', warehouseId: 3, role: Role.STAFF },
      { email: 'manager.dn@company.com', name: 'Bùi Anh Tuấn (Manager ĐN)', hashedPassword: '$2b$10$EpR2C89.1234567890pwdHashManager', warehouseId: 4, role: Role.MANAGER },
      { email: 'staff.dn01@company.com', name: 'Đỗ Thị Thu', hashedPassword: '$2b$10$EpR2C89.1234567890pwdHashStaff', warehouseId: 4, role: Role.STAFF },
      { email: 'manager.ct@company.com', name: 'Lý Văn Khoa (Manager CT)', hashedPassword: '$2b$10$EpR2C89.1234567890pwdHashManager', warehouseId: 5, role: Role.MANAGER },
      { email: 'staff.ct01@company.com', name: 'Trịnh Khánh Linh', hashedPassword: '$2b$10$EpR2C89.1234567890pwdHashStaff', warehouseId: 5, role: Role.STAFF },
    ],
  });

  console.log('🏷️ Đang chèn Categories, Brands & Suppliers...');
  await prisma.category.createMany({
    data: [
      { name: 'Laptop & Máy tính xách tay', description: 'Thiết bị máy tính di động' },
      { name: 'Điện thoại thông minh', description: 'Smartphone công nghệ cao' },
      { name: 'Màn hình máy tính', description: 'Màn hình PC văn phòng và Gaming' },
      { name: 'Linh kiện PC', description: 'RAM, SSD, VGA, CPU' },
      { name: 'Phụ kiện công nghệ', description: 'Tai nghe, Bàn phím, Chuột, Sạc' },
    ],
  });

  await prisma.brand.createMany({
    data: [
      { name: 'Apple', description: 'Thương hiệu Apple Inc.' },
      { name: 'Dell', description: 'Thương hiệu máy tính Dell' },
      { name: 'Samsung', description: 'Tập đoàn điện tử Samsung' },
      { name: 'ASUS', description: 'Thương hiệu ASUS Republic of Gamers' },
      { name: 'Logitech', description: 'Phụ kiện máy tính Logitech' },
      { name: 'Kingston', description: 'Linh kiện bộ nhớ Kingston' },
    ],
  });

  await prisma.supplier.createMany({
    data: [
      { name: 'Công ty Cổ phần FPT Synnex', description: 'Nhà phân phối thiết bị công nghệ lớn nhất' },
      { name: 'Tổng Công ty Dầu khí Viễn thông (Petrosetco)', description: 'Đơn vị nhập khẩu ủy quyền Apple & Samsung' },
      { name: 'Công ty TNHH SPC Computer', description: 'Chuyên cung cấp linh kiện PC & Màn hình' },
      { name: 'Nhà cung cấp Phong Vũ Logistics', description: 'Phân phối thiết bị gaming & phụ kiện' },
    ],
  });

  console.log('📱 Đang chèn Products...');
  await prisma.product.createMany({
    data: [
      { sku: 'LAP-APP-M201', name: 'MacBook Air M2 13 inch 256GB', categoryId: 1, brandId: 1, description: 'Laptop mỏng nhẹ chip Apple M2', price: 26990000.00 },
      { sku: 'LAP-APP-M302', name: 'MacBook Pro 14 inch M3 Pro', categoryId: 1, brandId: 1, description: 'Laptop chuyên nghiệp cho Developer & Designer', price: 49990000.00 },
      { sku: 'LAP-DEL-XPS13', name: 'Dell XPS 13 9320 Core i7', categoryId: 1, brandId: 2, description: 'Laptop cao cấp màn hình OLED', price: 41500000.00 },
      { sku: 'LAP-DEL-INS15', name: 'Dell Inspiron 15 3520 i5', categoryId: 1, brandId: 2, description: 'Laptop văn phòng mượt mà', price: 15490000.00 },
      { sku: 'LAP-ASU-ROG01', name: 'ASUS ROG Strix G16 RTX4060', categoryId: 1, brandId: 4, description: 'Laptop Gaming cấu hình khủng', price: 38990000.00 },
      { sku: 'TEL-APP-IP15P', name: 'iPhone 15 Pro Max 256GB', categoryId: 2, brandId: 1, description: 'Khung Titan, Chip A17 Pro', price: 29500000.00 },
      { sku: 'TEL-APP-IP140', name: 'iPhone 14 128GB', categoryId: 2, brandId: 1, description: 'Smartphone Apple tiêu chuẩn', price: 17200000.00 },
      { sku: 'TEL-SAM-S24U', name: 'Samsung Galaxy S24 Ultra 5G', categoryId: 2, brandId: 3, description: 'Tích hợp Galaxy AI, Camera 200MP', price: 28990000.00 },
      { sku: 'TEL-SAM-A540', name: 'Samsung Galaxy A54 5G 128GB', categoryId: 2, brandId: 3, description: 'Smartphone tầm trung chụp ảnh nét', price: 8490000.00 },
      { sku: 'MON-SAM-G701', name: 'Màn hình Samsung Odyssey G7 28 inch 4K 144Hz', categoryId: 3, brandId: 3, description: 'Màn hình Gaming đồ họa cao', price: 14900000.00 },
      { sku: 'MON-DEL-U2723', name: 'Màn hình Dell UltraSharp U2723QE 27 inch 4K', categoryId: 3, brandId: 2, description: 'Màn hình chuẩn màu đồ họa chuyên nghiệp', price: 12800000.00 },
      { sku: 'MON-ASU-VG248', name: 'Màn hình ASUS TUF Gaming VG249Q3A 180Hz', categoryId: 3, brandId: 4, description: 'Màn hình Gaming giá rẻ tần số quét cao', price: 3890000.00 },
      { sku: 'PAR-KIN-SSD1T', name: 'Ổ cứng SSD Kingston NV2 1TB PCIe 4.0 NVMe', categoryId: 4, brandId: 6, description: 'Tốc độ đọc ghi 3500MB/s', price: 1650000.00 },
      { sku: 'PAR-KIN-RAM16', name: 'RAM Kingston FURY Beast 16GB DDR5 5600MHz', categoryId: 4, brandId: 6, description: 'Bộ nhớ RAM PC hiệu năng cao', price: 1450000.00 },
      { sku: 'ACC-LOG-MXM3S', name: 'Chuột không dây Logitech MX Master 3S', categoryId: 5, brandId: 5, description: 'Chuột công thái học im lặng', price: 2290000.00 },
      { sku: 'ACC-LOG-K380', name: 'Bàn phím Bluetooth Logitech K380', categoryId: 5, brandId: 5, description: 'Bàn phím nhỏ gọn đa thiết bị', price: 650000.00 },
      { sku: 'ACC-LOG-G435', name: 'Tai nghe Wireless Logitech G435 SE', categoryId: 5, brandId: 5, description: 'Tai nghe Gaming siêu nhẹ', price: 1390000.00 },
      { sku: 'ACC-APP-APPR2', name: 'Tai nghe Apple AirPods Pro 2 MagSafe USB-C', categoryId: 5, brandId: 1, description: 'Chống ồn chủ động ANC', price: 5690000.00 },
      { sku: 'ACC-APP-ADAP20', name: 'Củ sạc nhanh Apple 20W Type-C', categoryId: 5, brandId: 1, description: 'Sạc nhanh chuẩn Power Delivery', price: 520000.00 },
      { sku: 'ACC-SAM-BAT10', name: 'Pin sạc dự phòng Samsung 10000mAh 25W', categoryId: 5, brandId: 3, description: 'Sạc dự phòng vỏ kim loại', price: 690000.00 },
    ],
  });

  console.log('📊 Đang chèn Inventories (Chuẩn hóa 1 Product - 1 Kho do ràng buộc @unique)...');
  await prisma.inventory.createMany({
    data: [
      { productId: 1, warehouseId: 1, supplierId: 1, quantity: 45, costPrice: 22000000.00 },
      { productId: 2, warehouseId: 1, supplierId: 1, quantity: 12, costPrice: 42000000.00 },
      { productId: 3, warehouseId: 4, supplierId: 2, quantity: 8, costPrice: 35000000.00 },
      { productId: 4, warehouseId: 5, supplierId: 2, quantity: 30, costPrice: 12500000.00 },
      { productId: 5, warehouseId: 3, supplierId: 4, quantity: 15, costPrice: 31000000.00 },
      { productId: 6, warehouseId: 1, supplierId: 2, quantity: 50, costPrice: 25000000.00 },
      { productId: 7, warehouseId: 2, supplierId: 2, quantity: 20, costPrice: 14000000.00 },
      { productId: 8, warehouseId: 1, supplierId: 2, quantity: 25, costPrice: 23500000.00 },
      { productId: 9, warehouseId: 2, supplierId: 2, quantity: 35, costPrice: 6500000.00 },
      { productId: 10, warehouseId: 1, supplierId: 3, quantity: 15, costPrice: 12000000.00 },
      { productId: 11, warehouseId: 3, supplierId: 3, quantity: 25, costPrice: 10500000.00 },
      { productId: 12, warehouseId: 2, supplierId: 3, quantity: 18, costPrice: 2900000.00 },
      { productId: 13, warehouseId: 3, supplierId: 3, quantity: 200, costPrice: 1200000.00 },
      { productId: 14, warehouseId: 1, supplierId: 3, quantity: 80, costPrice: 1000000.00 },
      { productId: 15, warehouseId: 3, supplierId: 4, quantity: 80, costPrice: 1800000.00 },
      { productId: 16, warehouseId: 2, supplierId: 4, quantity: 40, costPrice: 480000.00 },
      { productId: 17, warehouseId: 3, supplierId: 4, quantity: 30, costPrice: 950000.00 },
      { productId: 18, warehouseId: 1, supplierId: 1, quantity: 100, costPrice: 4500000.00 },
      { productId: 19, warehouseId: 2, supplierId: 1, quantity: 150, costPrice: 380000.00 },
      { productId: 20, warehouseId: 3, supplierId: 2, quantity: 90, costPrice: 500000.00 },
    ],
  });

  console.log('📜 Đang chèn Stock Transactions...');
  const now = new Date();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  await prisma.stockTransaction.createMany({
    data: [
      { userId: 3, productId: 1, warehouseId: 1, quantity: 50, type: TransactionType.IN, note: 'Nhập hàng lô đầu mùa từ FPT Synnex', createdAt: daysAgo(10) },
      { userId: 3, productId: 1, warehouseId: 1, quantity: 5, type: TransactionType.OUT, note: 'Xuất bán lẻ cho khách hàng', createdAt: daysAgo(8) },
      { userId: 4, productId: 6, warehouseId: 1, quantity: 60, type: TransactionType.IN, note: 'Nhập lô iPhone 15 Pro Max', createdAt: daysAgo(7) },
      { userId: 4, productId: 6, warehouseId: 1, toWarehouseId: 2, quantity: 10, type: TransactionType.TRANSFER, note: 'Chuyển kho 10 máy cho kho Hải Phòng', createdAt: daysAgo(5) },
      { userId: 6, productId: 6, warehouseId: 2, quantity: 10, type: TransactionType.IN, note: 'Nhận chuyển kho từ Kho Hà Nội', createdAt: daysAgo(5) },
      { userId: 6, productId: 19, warehouseId: 2, quantity: 200, type: TransactionType.IN, note: 'Nhập lô sạc 20W Apple', createdAt: daysAgo(4) },
      { userId: 6, productId: 19, warehouseId: 2, quantity: 50, type: TransactionType.OUT, note: 'Xuất đại lý bán lẻ Hải Phòng', createdAt: daysAgo(2) },
      { userId: 8, productId: 1, warehouseId: 3, quantity: 40, type: TransactionType.IN, note: 'Nhập kho tổng HCM', createdAt: daysAgo(12) },
      { userId: 8, productId: 2, warehouseId: 3, quantity: 20, type: TransactionType.IN, note: 'Nhập MacBook Pro M3', createdAt: daysAgo(11) },
      { userId: 9, productId: 2, warehouseId: 3, quantity: 2, type: TransactionType.OUT, note: 'Xuất bán doanh nghiệp', createdAt: daysAgo(3) },
      { userId: 9, productId: 13, warehouseId: 3, quantity: 200, type: TransactionType.IN, note: 'Nhập 200 ổ cứng SSD Kingston', createdAt: daysAgo(1) },
      { userId: 11, productId: 3, warehouseId: 4, quantity: 5, type: TransactionType.IN, note: 'Nhập kho Dell XPS Đà Nẵng', createdAt: daysAgo(6) },
      { userId: 13, productId: 4, warehouseId: 5, quantity: 12, type: TransactionType.IN, note: 'Nhập Dell Inspiron Cần Thơ', createdAt: daysAgo(3) },
    ],
  });

  console.log('🔔 Đang chèn Notifications...');
  await prisma.notification.createMany({
    data: [
      { userId: 3, title: 'Cảnh báo sắp hết hàng', content: 'Sản phẩm Dell XPS 13 9320 trong Kho Hà Nội chỉ còn 8 chiếc.', isRead: false, createdAt: daysAgo(1) },
      { userId: 4, title: 'Đơn xuất kho thành công', content: 'Yêu cầu chuyển kho 10 iPhone 15 Pro Max đã hoàn tất.', isRead: true, createdAt: daysAgo(4) },
      { userId: 8, title: 'Nhập kho thành công', content: 'Đã thêm 200 SSD Kingston 1TB vào Kho Hồ Chí Minh.', isRead: false, createdAt: now },
    ],
  });

  console.log('✅ Seed dữ liệu thành công!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });