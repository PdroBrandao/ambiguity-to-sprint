import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">System configuration and reference tables.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-violet-50 rounded-full flex items-center justify-center mb-4">
          <Settings size={22} className="text-violet-600" />
        </div>
        <h2 className="text-base font-semibold text-gray-800 mb-1">Coming in Sprint 3</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          Product catalog, fee schedules, payer rules, and vendor configuration will be manageable here. For now, reference data is pre-loaded.
        </p>
      </div>
    </div>
  );
}
