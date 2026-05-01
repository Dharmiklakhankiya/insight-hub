/**
 * Seed script – creates the initial SUPER_ADMIN user if none exists.
 *
 * Usage:
 *   npx tsx scripts/seed-super-admin.ts
 *
 * Environment variables required:
 *   MONGODB_URI
 *   SUPER_ADMIN_EMAIL    (default: admin@insighthub.com)
 *   SUPER_ADMIN_PASSWORD (default: SuperAdmin1234)
 *   SUPER_ADMIN_NAME     (default: Super Admin)
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/insight_hub";

async function seed() {
  console.log("Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI, { dbName: "insight_hub" });

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection not established");
  }

  const usersCollection = db.collection("users");

  const existing = await usersCollection.findOne({ role: "super_admin" });
  if (existing) {
    console.log(
      `SUPER_ADMIN already exists: ${existing.email}. Skipping seed.`,
    );
    await mongoose.disconnect();
    return;
  }

  const email = (
    process.env.SUPER_ADMIN_EMAIL || "admin@insighthub.com"
  ).toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin1234";
  const name = process.env.SUPER_ADMIN_NAME || "Super Admin";

  const passwordHash = await bcrypt.hash(password, 12);

  await usersCollection.insertOne({
    name,
    email,
    passwordHash,
    role: "super_admin",
    tenantId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(`✓ SUPER_ADMIN created: ${email}`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
