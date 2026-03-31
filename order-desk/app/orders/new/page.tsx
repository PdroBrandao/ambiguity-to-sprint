import NewOrderForm from "@/components/orders/NewOrderForm";

export default function NewOrderPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">New Order</h1>
        <p className="text-sm text-gray-500 mt-0.5">Fill in patient and product details — prices calculate automatically.</p>
      </div>
      <NewOrderForm />
    </div>
  );
}
