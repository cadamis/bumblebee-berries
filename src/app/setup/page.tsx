import { requireSetupIncomplete } from "@/lib/auth";
import SetupForm from "@/components/SetupForm";
import BumblebeeLogo from "@/components/BumblebeeLogo";

export default function SetupPage() {
  requireSetupIncomplete(); // Redirect away if already set up
  return (
    <div className="min-h-screen bg-gradient-to-br from-honey-100 to-honey-200 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-white rounded-full p-4 shadow-lg ring-4 ring-honey-300 mb-4">
            <BumblebeeLogo size={64} />
          </div>
          <h1 className="font-display text-3xl font-bold text-honey-900">
            Bumblebee Berries
          </h1>
          <p className="text-honey-700 mt-2">Welcome! Let's get you set up.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-berry-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Create admin password</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                This is the only step. You can change it later in Settings.
              </p>
            </div>
          </div>
          <SetupForm />
        </div>

        <p className="text-center mt-6 text-xs text-honey-700/70">
          This page is only shown once and cannot be accessed after setup.
        </p>
      </div>
    </div>
  );
}
