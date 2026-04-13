export default function Home() {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold text-primary">LogiCore Working</h1>
      <button className="btn btn-primary mt-4">This is a DaisyUI button</button>
      
      <div className="stats shadow mt-8 block">
        <div className="stat">
          <div className="stat-title">Total Shipments</div>
          <div className="stat-value text-primary">412</div>
          <div className="stat-desc">21% more than last month</div>
        </div>
      </div>
    </main>
  );
}