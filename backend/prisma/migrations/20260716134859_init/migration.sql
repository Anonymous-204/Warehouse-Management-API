-- AlterTable
ALTER TABLE "public"."Sessions" ALTER COLUMN "expiredAt" SET DEFAULT (now() + interval '1 hour');
