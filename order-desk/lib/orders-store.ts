import { PATIENTS, PRODUCTS, CLINICS, PAYERS, VENDORS, SAMPLE_ORDERS } from "./mock-data";

export type OrderStatus = "Draft" | "Ready to Process";

export interface OrderLineItem {
  productId: string;
  qty: number;
}

export interface Order {
  id: string;
  patientId: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderLineItem[];
  notes?: string;
  payerOverride?: string; // if different from patient default
}

// Persist store on globalThis so Turbopack module reloads don't wipe it
declare global {
  // eslint-disable-next-line no-var
  var __ordersStore: Order[] | undefined;
  // eslint-disable-next-line no-var
  var __ordersNextId: number | undefined;
}

if (!global.__ordersStore) {
  global.__ordersStore = SAMPLE_ORDERS.map((o) => ({
    ...o,
    status: o.status as OrderStatus,
    items: o.items.map((i) => ({ ...i })),
  }));
}
if (!global.__ordersNextId) {
  global.__ordersNextId = 42;
}

const getStore = () => global.__ordersStore!;
const getNextId = () => global.__ordersNextId!;
const bumpId = () => { global.__ordersNextId = global.__ordersNextId! + 1; };

export function getOrders(): Order[] {
  return [...getStore()].sort((a, b) => b.id.localeCompare(a.id));
}

export function getOrder(id: string): Order | undefined {
  return getStore().find((o) => o.id === id);
}

export function createOrder(data: Omit<Order, "id" | "createdAt">): Order {
  const order: Order = {
    ...data,
    id: `ORD-${String(getNextId()).padStart(4, "0")}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
  bumpId();
  global.__ordersStore = [order, ...getStore()];
  return order;
}

// ─── Helpers to resolve references ───────────────────────────────────────────

export function getPatient(id: string) {
  return PATIENTS.find((p) => p.id === id);
}

export function getClinic(id: string) {
  return CLINICS.find((c) => c.id === id);
}

export function getPayer(id: string) {
  return PAYERS.find((p) => p.id === id);
}

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

export function getVendor(id: string) {
  return VENDORS.find((v) => v.id === id);
}

// ─── Financial calculation engine ─────────────────────────────────────────────
// Single source of truth for all pricing logic.

export interface LineCalc {
  productId: string;
  qty: number;
  unitCost: number;
  unitBillable: number | null; // null = fee schedule not found
  unitPatientOwes: number;
  totalCost: number;
  totalBillable: number | null;
  isLowMargin: boolean;
  requiresManagerApproval: boolean;
  requiresMeasurementForm: boolean;
}

export interface OrderCalc {
  lines: LineCalc[];
  totalCost: number;
  totalBillable: number | null;
  totalPatientOwes: number;
  margin: number | null; // percentage
  isLowMargin: boolean;
  feeScheduleMissing: boolean;
}

export function calculateOrder(
  items: OrderLineItem[],
  payerId: string,
  isSelfPay: boolean
): OrderCalc {
  const lines: LineCalc[] = items.map((item) => {
    const product = getProduct(item.productId);
    if (!product) {
      return {
        productId: item.productId,
        qty: item.qty,
        unitCost: 0,
        unitBillable: null,
        unitPatientOwes: 0,
        totalCost: 0,
        totalBillable: null,
        isLowMargin: false,
        requiresManagerApproval: false,
        requiresMeasurementForm: false,
      };
    }

    const unitCost = product.cost;
    let unitBillable: number | null;

    if (isSelfPay) {
      unitBillable = product.msrp;
    } else {
      const schedule = product.feeSchedule as Record<string, number>;
      unitBillable = schedule[payerId] ?? null;
    }

    const unitPatientOwes = isSelfPay ? (unitBillable ?? 0) : 0;
    const totalCost = unitCost * item.qty;
    const totalBillable = unitBillable !== null ? unitBillable * item.qty : null;
    const margin =
      totalBillable !== null && totalBillable > 0
        ? ((totalBillable - totalCost) / totalBillable) * 100
        : null;
    const isLowMargin = margin !== null && margin < 20;

    return {
      productId: item.productId,
      qty: item.qty,
      unitCost,
      unitBillable,
      unitPatientOwes,
      totalCost,
      totalBillable,
      isLowMargin,
      requiresManagerApproval: product.requiresManagerApproval,
      requiresMeasurementForm: product.requiresMeasurementForm,
    };
  });

  const totalCost = lines.reduce((s, l) => s + l.totalCost, 0);
  const hasMissingFee = lines.some((l) => l.unitBillable === null);
  const totalBillable = hasMissingFee
    ? null
    : lines.reduce((s, l) => s + (l.totalBillable ?? 0), 0);
  const totalPatientOwes = lines.reduce((s, l) => s + l.unitPatientOwes * l.qty, 0);
  const margin =
    totalBillable !== null && totalBillable > 0
      ? ((totalBillable - totalCost) / totalBillable) * 100
      : null;

  return {
    lines,
    totalCost,
    totalBillable,
    totalPatientOwes,
    margin,
    isLowMargin: margin !== null && margin < 20,
    feeScheduleMissing: hasMissingFee,
  };
}
