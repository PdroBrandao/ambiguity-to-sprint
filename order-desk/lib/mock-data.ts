// ─── PAYERS ──────────────────────────────────────────────────────────────────

export const PAYERS = [
  { id: "medicare",  name: "Medicare",               isSelfPay: false },
  { id: "aetna",     name: "Aetna",                  isSelfPay: false },
  { id: "bcbs",      name: "BlueCross BlueShield",   isSelfPay: false },
  { id: "self_pay",  name: "Self-Pay",                isSelfPay: true  },
] as const;

// ─── VENDORS ─────────────────────────────────────────────────────────────────

export const VENDORS = [
  { id: "medi",     name: "Medi",             email: "orders@mediusa.com"        },
  { id: "juzo",     name: "Juzo",             email: "orders@juzousa.com"        },
  { id: "tactile",  name: "Tactile Systems",  email: "orders@tactilesystems.com" },
  { id: "trulife",  name: "Trulife",          email: "orders@trulife.com"        },
] as const;

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
// cost       = what ArcVault pays the vendor
// msrp       = retail price (used for self-pay)
// requiresMeasurementForm = therapist must send measurement form
// requiresManagerApproval = HCPCS triggers manager approval before proceeding

export const PRODUCTS = [
  {
    id:                     "sleeve-class2",
    name:                   "Compression Arm Sleeve, Class II",
    hcpcsCode:              "A6531",
    vendorId:               "medi",
    cost:                   45.00,
    msrp:                   89.00,
    requiresMeasurementForm: true,
    requiresManagerApproval: false,
    feeSchedule: {
      medicare: 67.00,
      aetna:    72.00,
      bcbs:     70.00,
    },
  },
  {
    id:                     "gauntlet",
    name:                   "Compression Gauntlet",
    hcpcsCode:              "A6530",
    vendorId:               "juzo",
    cost:                   38.00,
    msrp:                   75.00,
    requiresMeasurementForm: true,
    requiresManagerApproval: false,
    feeSchedule: {
      medicare: 52.00,
      aetna:    56.00,
      bcbs:     54.00,
    },
  },
  {
    id:                     "lymphedema-pump",
    name:                   "Lymphedema Pump, Single Chamber",
    hcpcsCode:              "E0650",
    vendorId:               "tactile",
    cost:                   450.00,
    msrp:                   1200.00,
    requiresMeasurementForm: false,
    requiresManagerApproval: true,   // ← triggers manager approval warning
    feeSchedule: {
      medicare: 890.00,
      aetna:    920.00,
      bcbs:     900.00,
    },
  },
  {
    id:                     "mastectomy-bra",
    name:                   "Compression Bra, Post-Mastectomy",
    hcpcsCode:              "L8000",
    vendorId:               "trulife",
    cost:                   55.00,
    msrp:                   110.00,
    requiresMeasurementForm: true,
    requiresManagerApproval: false,
    feeSchedule: {
      medicare: 82.00,
      aetna:    88.00,
      bcbs:     85.00,
    },
  },
  {
    id:                     "stocking-knee",
    name:                   "Knee-High Compression Stocking, 30–40 mmHg",
    hcpcsCode:              "A6533",
    vendorId:               "medi",
    cost:                   28.00,
    msrp:                   65.00,
    requiresMeasurementForm: false,
    requiresManagerApproval: false,
    feeSchedule: {
      medicare: 48.00,
      aetna:    52.00,
      bcbs:     50.00,
    },
  },
] as const;

// ─── CLINICS ─────────────────────────────────────────────────────────────────

export const CLINICS = [
  {
    id:        "clinic-boston",
    name:      "Boston Physical Therapy Center",
    therapist: "Franshezco Lliuyacc",
    state:     "MA",
  },
  {
    id:        "clinic-bayarea",
    name:      "Bay Area Lymphedema Clinic",
    therapist: "Ethan Sun",
    state:     "CA",
  },
  {
    id:        "clinic-austin",
    name:      "Austin Wellness PT",
    therapist: "Jeremy Topp",
    state:     "TX",
  },
] as const;

// ─── PATIENTS ────────────────────────────────────────────────────────────────

export const PATIENTS = [
  {
    id:          "p-005",
    name:        "Ethan Sun",
    dob:         "1990-07-15",
    payerId:     "aetna",
    clinicId:    "clinic-bayarea",
    shippingAddress: {
      street:  "210 Market Street",
      city:    "San Francisco",
      state:   "CA",
      zip:     "94105",
    },
  },
  {
    id:          "p-006",
    name:        "Jeremy Topp",
    dob:         "1988-03-22",
    payerId:     "medicare",
    clinicId:    "clinic-austin",
    shippingAddress: {
      street:  "430 Congress Avenue",
      city:    "Austin",
      state:   "TX",
      zip:     "78701",
    },
  },
] as const;

// ─── SAMPLE ORDERS (para popular a lista de ordens) ───────────────────────────

export const SAMPLE_ORDERS = [
  {
    id:        "ORD-0041",
    patientId: "p-005",
    status:    "Ready to Process",
    createdAt: "2026-03-29",
    items: [
      { productId: "sleeve-class2", qty: 1 },
      { productId: "gauntlet",      qty: 1 },
    ],
  },
  {
    id:        "ORD-0040",
    patientId: "p-006",
    status:    "Draft",
    createdAt: "2026-03-28",
    items: [
      { productId: "stocking-knee", qty: 2 },
    ],
  },
] as const;
