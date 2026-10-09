import Link from "next/link";

export default function Home() {
  return (
    <main>
        <h1>Ejemplo miniProyecto</h1>
        <p><Link href="/practica/1">Ir a practica 1 como ruta dinamica</Link></p>
    </main>
  );
}