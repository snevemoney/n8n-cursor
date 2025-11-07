export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            ⚡ LightningFlow AI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your AI-powered workflow automation platform is online!
          </p>
          <div className="space-y-4">
            <a 
              href="http://app.lightningflow.local" 
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </a>
            <div className="text-sm text-gray-500">
              <p>Status: <span className="text-green-600 font-semibold">Online</span></p>
              <p>Environment: Development</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}