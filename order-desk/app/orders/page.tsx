import Link from "next/link";
import { PlusCircle, ChevronRight } from "lucide-react";
import { getOrders, getPatient, getPayer } from "@/lib/orders-store";
import clsx from "clsx";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  "Draft":            "bg-gray-100 text-gray-600",
  "Ready to Process": "bg-green-100 text-green-700",
};

export default function OrdersPage() {
  const orders = getOrders();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} orders total</p>
        </div>
        <Link
          href="/orders/new"
          className="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <PlusCircle size={16} />
          New Order
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Order</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Patient</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Payer</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => {
              const patient = getPatient(order.patientId);
              const payer = getPayer(patient?.payerId ?? "");
              return (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{order.id}</td>
                  <td className="px-4 py-3 text-gray-700">{patient?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{payer?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{order.createdAt}</td>
                  <td className="px-4 py-3">
                    <span className={clsx("px-2.5 py-1 rounded-full text-xs font-medium", STATUS_STYLES[order.status])}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/orders/${order.id}`} className="text-gray-400 hover:text-violet-700">
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  No orders yet. <Link href="/orders/new" className="text-violet-700 underline">Create the first one</Link>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
