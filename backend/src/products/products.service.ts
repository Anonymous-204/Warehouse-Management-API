import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, TransactionType } from '@prisma/client';
import { CreateProductDto } from './products.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // Tạo sản phẩm mới
  //1.1 tiền xử lý dữ liệu sản phẩm trước khi tạo
  async getBrandAndCategory() {
    const [brands, categories] = await Promise.all([
      this.prisma.brand.findMany({
        select: {id:true, name:true}
      }),
      this.prisma.category.findMany({
        select:{id:true, name:true}
      })
    ])
    return {brands, categories}
  }
  //1.2 tạo sản phẩm mới
  async createProduct(productData:CreateProductDto ) {
    const {sku, name, price, categoryId, brandId, description, image } = productData;
    try{
      return await this.prisma.product.create({
        data: {
          sku: sku || 'sku-123', 
          name: name || 'Sản phẩm mới',
          price: price || 0,
          categoryId: categoryId || 0, 
          brandId: brandId || 0,
          description: description|| '',
          image: image
        }
      });
    }
    catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('SKU đã tồn tại');
      }

      throw err;
    }
  }
  // Lấy danh sách sản phẩm theo warehouseId
  async getAllProduct() {
    const inventory = await this.prisma.product.findMany({
      select: {
        id: true,
        sku: true,
        name: true,
        price: true,
        image:true,
        category: { select: { name: true } },
        brand: { select: { name: true } },
      },
    }); 
    const formattedInventory = inventory.map((item) => ({
      Id: item.id,
      sku: item.sku,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category.name,
      brand: item.brand.name,
    }));
    return formattedInventory;
  }
}