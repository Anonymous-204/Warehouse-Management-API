-- AlterTable
ALTER TABLE "public"."stock_transactions" ADD COLUMN     "stock_variance" INTEGER,
ADD COLUMN     "to_warehouse_id" INTEGER;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "warehouse_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_transactions" ADD CONSTRAINT "stock_transactions_to_warehouse_id_fkey" FOREIGN KEY ("to_warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
