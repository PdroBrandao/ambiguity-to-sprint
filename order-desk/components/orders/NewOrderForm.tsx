"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Info, PlusCircle, Trash2, CheckCircle } from "lucide-react";
import clsx from "clsx";
import { PATIENTS, PRODUCTS, PAYERS, CLINICS } from "@/lib/mock-data";
import { calculateOrder, type OrderLineItem } from "@/lib/orders-store";

const PATIENTS_LIST = [...PATIENTS];
const PRODUCTS_LIST = [...PRODUCTS];
const PAYERS_LIST = [...PAYERS];
const CLINICS_LIST = [...CLINICS];

interface LineItem extends OrderLineItem {
  key: number;
}

let lineKey = 0;

export default function NewOrderForm() {
  const router = useRouter();
  const [patientId, setPatientId] = useState("");
  const [payerIdOverride, setPayerIdOverride] = useState("");
  const [isSelfPay, setIsSelfPay] = useState(false);
  const [lines, setLines] = useState<LineItem[]>([{ key: lineKey++, productId: "", qty: 1 }]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"Draft" | "Ready to Process">("Draft");
  const [saving, setSaving] = useState(false);

  const patient = PATIENTS_LIST.find((p) => p.id === patientId);
  const clinic = CLINICS_LIST.find((c) => c.id === patient?.clinicId);
  const effectivePayerId = isSelfPay ? "self_pay" : (payerIdOverride || patient?.payerId || "");

  const validLines = lines.filter((l) => l.productId && l.qty > 0);
  const calc = useMemo(
    () =>
      validLines.length > 0
        ? calculateOrder(validLines, effectivePayerId, isSelfPay)
        : null,
    [validLines, effectivePayerId, isSelfPay]
  );

  const addLine = () => setLines((prev) => [...prev, { key: lineKey++, productId: "", qty: 1 }]);
  const removeLine = (key: number) => setLines((prev) => prev.filter((l) => l.key !== key));
  const updateLine = (key: number, patch: Partial<LineItem>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const handlePatientChange = (id: string) => {
    setPatientId(id);
    setPayerIdOverride("");
    setIsSelfPay(false);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId || validLines.length === 0) return;
    setSaving(true);
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, payerOverride: effectivePayerId, items: validLines, notes, status }),
    });
    router.refresh();
    router.push("/orders");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient */}
      <Section title="Patient & Insurance">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Patient">
            <select
              value={patientId}
              onChange={(e) => handlePatientChange(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Select patient…</option>
              {PATIENTS_LIST.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Clinic">
            <input
              readOnly
              value={clinic ? `${clinic.name}` : ""}
              placeholder="Auto-populated from patient"
              className={clsx(inputClass, "bg-gray-50 text-gray-500")}
            />
          </Field>
        </div>

        {patient && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 grid grid-cols-2 gap-2">
            <span><span className="font-medium">DOB:</span> {patient.dob}</span>
            <span><span className="font-medium">Therapist:</span> {clinic?.therapist ?? "—"}</span>
            <span className="col-span-2">
              <span className="font-medium">Ship to:</span>{" "}
              {patient.shippingAddress.street}, {patient.shippingAddress.city}, {patient.shippingAddress.state} {patient.shippingAddress.zip}
            </span>
          </div>
        )}

        <div className="mt-4 flex items-center gap-4">
          <Field label="Payer">
            <select
              value={isSelfPay ? "self_pay" : (payerIdOverride || patient?.payerId || "")}
              onChange={(e) => {
                if (e.target.value === "self_pay") {
                  setIsSelfPay(true);
                  setPayerIdOverride("");
                } else {
                  setIsSelfPay(false);
                  setPayerIdOverride(e.target.value);
                }
              }}
              className={inputClass}
            >
              <option value="">Select payer…</option>
              {PAYERS_LIST.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mt-5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isSelfPay}
              onChange={(e) => { setIsSelfPay(e.target.checked); if (e.target.checked) setPayerIdOverride(""); }}
              className="accent-violet-700 w-4 h-4"
            />
            Self-Pay (use MSRP)
          </label>
        </div>

        {isSelfPay && (
          <div className="mt-2 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <Info size={14} />
            Self-pay mode: prices will default to vendor MSRP.
          </div>
        )}
      </Section>

      {/* Line items */}
      <Section title="Order Items">
        <div className="space-y-3">
          {lines.map((line, idx) => {
            const product = PRODUCTS_LIST.find((p) => p.id === line.productId);
            const lineCalc = calc?.lines.find((l) => l.productId === line.productId);
            return (
              <div key={line.key} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-400 w-5 shrink-0">#{idx + 1}</span>
                  <div className="flex-1">
                    <select
                      value={line.productId}
                      onChange={(e) => updateLine(line.key, { productId: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">Select product…</option>
                      {PRODUCTS_LIST.map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.hcpcsCode}] {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24 shrink-0">
                    <input
                      type="number"
                      min={1}
                      value={line.qty}
                      onChange={(e) => updateLine(line.key, { qty: parseInt(e.target.value) || 1 })}
                      className={clsx(inputClass, "text-center")}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(line.key)}
                    disabled={lines.length === 1}
                    className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-30"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Auto-populated info */}
                {product && (
                  <div className="ml-8 grid grid-cols-4 gap-2 text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2">
                    <span><span className="font-medium">Vendor:</span> {product.vendorId}</span>
                    <span><span className="font-medium">HCPCS:</span> {product.hcpcsCode}</span>
                    <span><span className="font-medium">Cost:</span> ${product.cost.toFixed(2)}</span>
                    <span>
                      <span className="font-medium">Billable:</span>{" "}
                      {lineCalc?.unitBillable != null
                        ? `$${lineCalc.unitBillable.toFixed(2)}`
                        : <span className="text-amber-600">Fee schedule not found — review manually</span>}
                    </span>
                  </div>
                )}

                {/* Warnings */}
                {product?.requiresManagerApproval && (
                  <div className="ml-8 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                    <AlertTriangle size={13} />
                    HCPCS {product.hcpcsCode} requires manager approval before processing.
                  </div>
                )}
                {product?.requiresMeasurementForm && (
                  <div className="ml-8 flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
                    <Info size={13} />
                    Measurement form required from therapist for this product.
                  </div>
                )}
                {lineCalc?.isLowMargin && (
                  <div className="ml-8 flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    <AlertTriangle size={13} />
                    Low margin on this item. Review pricing before submitting.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addLine}
          className="mt-3 flex items-center gap-2 text-sm text-violet-700 hover:text-violet-900 font-medium"
        >
          <PlusCircle size={15} />
          Add item
        </button>
      </Section>

      {/* Financial preview */}
      {calc && (
        <Section title="Financial Preview">
          {calc.feeScheduleMissing && (
            <div className="mb-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertTriangle size={14} />
              One or more items have no fee schedule for this payer. Totals may be incomplete.
            </div>
          )}
          <div className="grid grid-cols-4 gap-4">
            <Metric label="Total Cost" value={`$${calc.totalCost.toFixed(2)}`} />
            <Metric
              label="Billable Amount"
              value={calc.totalBillable != null ? `$${calc.totalBillable.toFixed(2)}` : "—"}
            />
            <Metric
              label="Margin"
              value={calc.margin != null ? `${calc.margin.toFixed(1)}%` : "—"}
              highlight={calc.isLowMargin ? "red" : calc.margin !== null ? "green" : undefined}
            />
            <Metric
              label="Patient Owes"
              value={`$${calc.totalPatientOwes.toFixed(2)}`}
              sub={isSelfPay ? "Self-pay (MSRP)" : "Insurance copay"}
            />
          </div>
        </Section>
      )}

      {/* Notes */}
      <Section title="Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Special instructions, exceptions, or anything that doesn't fit the fields above…"
          rows={3}
          className={clsx(inputClass, "resize-none")}
        />
      </Section>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Save as:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className={clsx(inputClass, "w-48")}
          >
            <option value="Draft">Draft</option>
            <option value="Ready to Process">Ready to Process</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/orders")}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !patientId || validLines.every((l) => !l.productId)}
            className="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            <CheckCircle size={15} />
            {saving ? "Saving…" : "Save Order"}
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Small sub-components ─────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "red" | "green";
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div
        className={clsx(
          "text-lg font-semibold",
          highlight === "red" && "text-red-600",
          highlight === "green" && "text-green-700",
          !highlight && "text-gray-900"
        )}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition";
