import { connectDb } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { Tenant } from "@/lib/types";
import type {
  CreateTenantInput,
  UpdateTenantInput,
} from "@/lib/validators/user.schema";
import { TenantModel } from "@/models/Tenant";

/* ------------------------------------------------------------------ */
/*  List                                                               */
/* ------------------------------------------------------------------ */

export async function listTenants(): Promise<Tenant[]> {
  await connectDb();

  const tenants = await TenantModel.find().sort({ name: 1 }).lean();

  return tenants.map((t) => ({
    id: String(t._id),
    name: t.name,
  }));
}

/* ------------------------------------------------------------------ */
/*  Get by ID                                                          */
/* ------------------------------------------------------------------ */

export async function getTenantById(tenantId: string): Promise<Tenant> {
  await connectDb();

  const tenant = await TenantModel.findById(tenantId).lean();
  if (!tenant) {
    throw new AppError("Tenant not found", 404);
  }

  return { id: String(tenant._id), name: tenant.name };
}

/* ------------------------------------------------------------------ */
/*  Create                                                             */
/* ------------------------------------------------------------------ */

export async function createTenant(input: CreateTenantInput): Promise<Tenant> {
  await connectDb();

  const existing = await TenantModel.findOne({ name: input.name }).lean();
  if (existing) {
    throw new AppError("A tenant with this name already exists", 409);
  }

  const created = await TenantModel.create({ name: input.name });

  return { id: String(created._id), name: created.name };
}

/* ------------------------------------------------------------------ */
/*  Update                                                             */
/* ------------------------------------------------------------------ */

export async function updateTenant(
  tenantId: string,
  input: UpdateTenantInput,
): Promise<Tenant> {
  await connectDb();

  const tenant = await TenantModel.findById(tenantId);
  if (!tenant) {
    throw new AppError("Tenant not found", 404);
  }

  if (input.name) {
    const duplicate = await TenantModel.findOne({
      name: input.name,
      _id: { $ne: tenantId },
    }).lean();
    if (duplicate) {
      throw new AppError("A tenant with this name already exists", 409);
    }
    tenant.name = input.name;
  }

  await tenant.save();

  return { id: String(tenant._id), name: tenant.name };
}

/* ------------------------------------------------------------------ */
/*  Delete                                                             */
/* ------------------------------------------------------------------ */

export async function deleteTenant(tenantId: string): Promise<void> {
  await connectDb();

  const tenant = await TenantModel.findById(tenantId);
  if (!tenant) {
    throw new AppError("Tenant not found", 404);
  }

  await tenant.deleteOne();
}
