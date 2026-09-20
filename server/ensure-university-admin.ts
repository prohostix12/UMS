import prisma from './src/lib/prisma.js';
import bcrypt from 'bcryptjs';

const organization = await prisma.organization.upsert({
  where: { id: 'university-admin' },
  update: {},
  create: {
    id: 'university-admin',
    name: 'University Administration',
    status: 'active',
    email: 'university-admin@erp.com',
    phone: '0000000000',
    address: 'University Administration',
  },
});

const user = await prisma.user.upsert({
  where: { email: 'admin@edutechglobal.com' },
  update: {
    userId: 'admin',
    organizationId: organization.id,
    password: await bcrypt.hash('orgadmin123', 10),
    name: 'University Admin',
    role: 'org_admin',
    status: 'active',
  },
  create: {
    userId: 'admin',
    organizationId: organization.id,
    email: 'admin@edutechglobal.com',
    password: await bcrypt.hash('orgadmin123', 10),
    name: 'University Admin',
    role: 'org_admin',
    status: 'active',
  },
});

console.log(JSON.stringify({
  email: user.email,
  userId: user.userId,
  role: user.role,
  passwordMatches: await bcrypt.compare('orgadmin123', user.password),
}));

await prisma.$disconnect();
