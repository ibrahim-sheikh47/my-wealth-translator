export default function Income() {
  return (
    <div className="min-h-screen text-white px-6 py-8 lg:px-12 lg:py-12" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#c7a481' }}>
          Income
        </h1>
        <p className="text-zinc-400 text-lg">
          Translate your income and maximize your earnings.
        </p>

        <div className="mt-8 p-6 rounded-2xl border" style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-zinc-400">
            This section is under development. Check back soon for updates.
          </p>
        </div>
      </div>
    </div>
  );
}