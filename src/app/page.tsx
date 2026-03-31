export default function Home() {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold text-primary">LogiCore Funcionando</h1>
      <button className="btn btn-primary mt-4">Este es un botón de DaisyUI</button>
      
      <div className="stats shadow mt-8 block">
        <div className="stat">
          <div className="stat-title">Envíos Totales</div>
          <div className="stat-value text-primary">412</div>
          <div className="stat-desc">21% más que el mes pasado</div>
        </div>
      </div>
    </main>
  );
}