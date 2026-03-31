import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { getOrder, getPatient, getPayer, getClinic, getProduct, getVendor, calculateOrder } from "@/lib/orders-store";
import clsx from "clsx";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  "Draft":            "bg-gray-100 text-gray-600",
  "Ready to Process": "bg-green-100 text-green-700",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) notFound();

  const patient  = getPatient(order.patientId);
  const payer    = getPayer(patient?.payerId ?? "");
  const clinic   = getClinic(patient?.clinicId ?? "");
  const isSelfPay = payer?.isSelfPay ?? false;
  const calc     = calculateOrder(order.items, payer?.id ?? "", isSelfPay);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/orders" className="text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">{order.id}</h1>
            <span className={clsx("px-2.5 py-1 rounded-full text-xs font-medium", STATUS_STYLES[order.status])}>
              {order.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Created {order.createdAt}</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Patient */}
        <Card title="Patient & Insurance">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Row label="Patient"   value={patient?.name ?? "—"} />
            <Row label="DOB"       value={patient?.dob ?? "—"} />
            <Row label="Payer"     value={payer?.name ?? "—"} />
            <Row label="Clinic"    value={clinic?.name ?? "—"} />
            <Row label="Therapist" value={clinic?.therapist ?? "—"} />
            <Row
              label="Ship to"
              value={
                patient
                  ? `${patient.shippingAddress.street}, ${patient.shippingAddress.city}, ${patient.shippingAddress.state} ${patient.shippingAddress.zip}`
                  : "—"
              }
            />
          </dl>
        </Card>

        {/* Items */}
        <Card title="Order Items">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="pb-2 font-medium text-gray-500">Product</th>
                <th className="pb-2 font-medium text-gray-500">HCPCS</th>
                <th className="pb-2 font-medium text-gray-500">Vendor</th>
                <th className="pb-2 font-medium text-gray-500 text-right">Qty</th>
                <th className="pb-2 font-medium text-gray-500 text-right">Cost</th>
                <th className="pb-2 font-medium text-gray-500 text-right">Billable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {calc.lines.map((line) => {
                const product = getProduct(line.productId);
                const vendor  = getVendor(product?.vendorId ?? "");
                return (
                  <tr key={line.productId}>
                    <td className="py-2 text-gray-800">{product?.name ?? line.productId}</td>
                    <td className="py-2 text-gray-500">{product?.hcpcsCode ?? "—"}</td>
                    <td className="py-2 text-gray-500">{vendor?.name ?? "—"}</td>
                    <td className="py-2 text-right text-gray-700">{line.qty}</td>
                    <td className="py-2 text-right text-gray-700">${line.totalCost.toFixed(2)}</td>
                    <td className="py-2 text-right text-gray-700">
                      {line.totalBillable != null ? `$${line.totalBillable.toFixed(2)}` : <span className="text-amber-600">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {/* Financial summary */}
        <Card title="Financial Summary">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <Metric label="Total Cost"      value={`$${calc.totalCost.toFixed(2)}`} />
            <Metric label="Billable Amount" value={calc.totalBillable != null ? `$${calc.totalBillable.toFixed(2)}` : "—"} />
            <Metric label="Margin"          value={calc.margin != null ? `${calc.margin.toFixed(1)}%` : "—"} highlight={calc.isLowMargin ? "red" : "green"} />
            <Metric label="Patient Owes"    value={`$${calc.totalPatientOwes.toFixed(2)}`} />
          </div>
        </Card>

        {/* Notes */}
        {order.notes && (
          <Card title="Notes">
            <p className="text-sm text-gray-700">{order.notes}</p>
          </Card>
        )}

        {/* Sprint 2 placeholder */}
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-5 flex items-start gap-3">
          <FileText size={18} className="text-violet-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-violet-800">Document generation — coming in Sprint 2</p>
            <p className="text-xs text-violet-600 mt-0.5">
              Encounter form, patient invoice with Stripe payment link, and proof of delivery will be generated from this order automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-gray-800">{value}</dd>
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: "red" | "green" }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={clsx(
        "text-lg font-semibold",
        highlight === "red" && "text-red-600",
        highlight === "green" && "text-green-700",
        !highlight && "text-gray-900"
      )}>
        {value}
      </div>
    </div>
  );
}
