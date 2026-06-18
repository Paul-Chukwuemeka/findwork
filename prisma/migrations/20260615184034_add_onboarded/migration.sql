-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "portfolioUrl" TEXT,
ADD COLUMN     "skills" TEXT[];
