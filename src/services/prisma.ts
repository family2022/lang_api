import { PrismaClient } from '../../prisma/client';

const prisma = new PrismaClient();

const init = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('[OK] Prisma connected');
  } catch (error) {
    console.error('[ERROR] Prisma connection failed');
    console.error(error);
    process.exit(1);
  }
};

init();

export default prisma;
