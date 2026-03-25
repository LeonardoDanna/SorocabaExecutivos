import Link from "next/link";
import Logo from "./components/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center px-4">
      <div className="text-center">
        <Link href="/" className="inline-block mb-10">
          <Logo size="md" />
        </Link>

        <p className="text-[#CC0000] uppercase tracking-[0.3em] text-sm font-semibold mb-2">
          Erro 404
        </p>
        <h1
          className="text-8xl font-bold text-[#F0F0F0] mb-4"
          style={{ fontFamily: "var(--font-oswald)" }}
        >
          404
        </h1>
        <p className="text-[#A0A0A0] text-lg mb-2">Página não encontrada.</p>
        <p className="text-[#A0A0A0] text-sm mb-10">
          O endereço que você tentou acessar não existe ou foi removido.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="bg-[#CC0000] text-white px-6 py-3 rounded font-semibold hover:bg-[#E50000] transition-colors"
          >
            Voltar ao início
          </Link>
          <Link
            href="/solicitar"
            className="border border-[#444] text-[#A0A0A0] px-6 py-3 rounded font-semibold hover:border-[#CC0000] hover:text-[#F0F0F0] transition-colors"
          >
            Solicitar corrida
          </Link>
        </div>
      </div>
    </div>
  );
}
