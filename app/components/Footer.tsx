import Logo from "./Logo";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#161616] border-t border-[#444444] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <Logo size="sm" />
          <p className="mt-3 text-brand-muted text-sm leading-relaxed">
            Segurança, conforto e pontualidade em cada viagem.
          </p>
        </div>

        <div>
          <h4 className="text-brand-text font-semibold uppercase tracking-wider text-sm mb-4">Contato</h4>
          <ul className="space-y-3 text-brand-muted text-sm">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-brand-red" />
              Rua Dr. Lineu Mattos Silveira, 241 — Sorocaba/SP, CEP 18045-435
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="shrink-0 text-brand-red" />
              contato@sorocabaexecutivos.com.br
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-brand-text font-semibold uppercase tracking-wider text-sm mb-4">Links</h4>
          <ul className="space-y-2 text-brand-muted text-sm">
            <li><a href="#sobre" className="hover:text-brand-text transition-colors">Sobre nós</a></li>
            <li><a href="#servicos" className="hover:text-brand-text transition-colors">Serviços</a></li>
            <li><a href="#precos" className="hover:text-brand-text transition-colors">Tabela de preços</a></li>
            <li><a href="/login" className="hover:text-brand-text transition-colors">Acessar plataforma</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#333333] px-6 py-4 text-center text-xs text-brand-muted">
        CNPJ 48.409.953/0001-34 · © {new Date().getFullYear()} Sorocaba Executivos. Todos os direitos reservados.
      </div>
    </footer>
  );
}
