-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "refreshToken" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
