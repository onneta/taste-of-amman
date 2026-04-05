export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Taste of Amman</h1>
      <p className="text-lg text-gray-600 mb-8">restaurant</p>
      <div className="max-w-2xl text-center">
        <h2 className="text-xl font-semibold mb-4">Planned Features</h2>
        <ul className="space-y-2 text-left">
          <li className="flex items-center gap-2"><span className="text-green-500">●</span> Online ordering system with payment processing and delivery management</li>
          <li className="flex items-center gap-2"><span className="text-green-500">●</span> Customer loyalty program with segmented email marketing campaigns</li>
          <li className="flex items-center gap-2"><span className="text-green-500">●</span> Real-time operational dashboard with revenue and food cost tracking</li>
          <li className="flex items-center gap-2"><span className="text-green-500">●</span> Google Business Profile optimization with automated review generation</li>
          <li className="flex items-center gap-2"><span className="text-green-500">●</span> Staff scheduling, CRM, and inventory management system</li>
        </ul>
      </div>
      <footer className="mt-16 text-sm text-gray-400">
        Built with ONI — AI that builds businesses
      </footer>
    </main>
  );
}
