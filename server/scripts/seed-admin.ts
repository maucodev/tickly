import { hashPassword } from "better-auth/crypto";
import { Role } from "../generated/prisma/client";
import { prisma } from "../src/lib/prisma";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in server/.env");
}

const existing = await prisma.user.findUnique({ where: { email } });

if (existing) {
  console.log(`User ${email} already exists (id: ${existing.id}), skipping.`);
  process.exit(0);
}

const user = await prisma.user.create({
  data: {
    id: crypto.randomUUID(),
    name: "Admin",
    email,
    emailVerified: true,
    role: Role.admin,
  },
});

await prisma.account.create({
  data: {
    id: crypto.randomUUID(),
    accountId: user.id,
    providerId: "credential",
    userId: user.id,
    password: await hashPassword(password),
  },
});

console.log(`Admin user created: ${email} (id: ${user.id})`);
process.exit(0);
