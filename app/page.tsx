import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import {
  Car,
  Shield,
  Zap,
  Headphones,
  Plane,
  Building2,
  Star,
  UserPlus,
  MapPin,
  CheckCircle,
} from "lucide-react";

const diferenciais = [
  {
    icon: Car,
    title: "Veículos novos e revisados",
    text: "Frota bem equipada, higienizada e em plenas condições de uso. Carro Sedan e Van Executiva com ar condicionado.",
  },
  {
    icon: Shield,
    title: "Motoristas habilitados e treinados",
    text: "Profissionais comprometidos com sua segurança, cordialidade, eficiência e discrição em cada trajeto.",
  },
  {
    icon: Zap,
    title: "Tecnologia de última geração",
    text: "Equipamentos de ponta para fornecer ainda mais segurança e controle durante toda a viagem.",
  },
  {
    icon: Headphones,
    title: "Atendimento rápido",
    text: "Nossa central está pronta para atender sua demanda com agilidade e resolver qualquer situação.",
  },
];

const servicos = [
  { icon: Plane, label: "Transfer GRU, CGH e VCP" },
  { icon: Building2, label: "Eventos corporativos e congressos" },
  { icon: Car, label: "Táxi executivo em Sorocaba" },
  { icon: MapPin, label: "Traslado para hotéis, spas e resorts" },
  { icon: Star, label: "Transporte de VIPs e palestrantes" },
  { icon: CheckCircle, label: "Transfer para todo o Estado de SP" },
];

const precos = [
  { trajeto: "Sorocaba × Aeroporto de Guarulhos (GRU)", valor: "R$ 400,00" },
  { trajeto: "Sorocaba × Aeroporto de Congonhas (CGH)", valor: "R$ 350,00" },
  { trajeto: "Sorocaba × Aeroporto de Viracopos (VCP)", valor: "R$ 300,00" },
  { trajeto: "Sorocaba × Taubaté", valor: "R$ 600,00" },
  { trajeto: "Sorocaba × São Vicente", valor: "R$ 500,00" },
  { trajeto: "Sorocaba × Cosmópolis", valor: "R$ 400,00" },
  { trajeto: "Táxi Sorocaba / Zona Norte", valor: "R$ 80,00" },
  { trajeto: "Táxi Sorocaba / Zona Sul", valor: "R$ 80,00" },
  { trajeto: "Táxi Sorocaba / Zona Oeste", valor: "R$ 80,00" },
  { trajeto: "Táxi Sorocaba / Zona Leste", valor: "R$ 80,00" },
  { trajeto: "Sorocaba × Votorantim", valor: "R$ 80,00" },
  { trajeto: "Sorocaba × Itu", valor: "R$ 120,00" },
];

const passos = [
  {
    num: "01",
    title: "Crie sua conta",
    text: "Cadastro rápido com nome, e-mail e telefone. Pronto para solicitar sua primeira corrida.",
  },
  {
    num: "02",
    title: "Solicite sua corrida",
    text: "Informe origem, destino e horário. Escolha entre destinos frequentes ou insira um novo endereço.",
  },
  {
    num: "03",
    title: "Acompanhe em tempo real",
    text: "Receba confirmação pelo WhatsApp e acompanhe o motorista até sua chegada.",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E1E1E] via-[#2B2B2B] to-[#1E1E1E]" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#CC0000]/5 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-[#CC0000] uppercase tracking-[0.3em] text-sm font-semibold mb-4">
              Transporte Executivo Premium
            </p>
            <h1
              className="text-5xl md:text-7xl font-bold leading-tight mb-6 uppercase text-[#F0F0F0]"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Transporte Executivo em{" "}
              <span className="text-[#CC0000]">Sorocaba</span> e Região
            </h1>
            <p className="text-[#A0A0A0] text-xl mb-10 leading-relaxed">
              Segurança, conforto e pontualidade em cada viagem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/cadastro"
                className="bg-[#CC0000] text-white px-8 py-4 rounded text-center font-semibold hover:bg-[#E50000] transition-colors text-lg"
              >
                Solicitar uma corrida
              </Link>
              <a
                href="#precos"
                className="border border-[#444444] text-[#F0F0F0] px-8 py-4 rounded text-center font-semibold hover:border-[#CC0000] transition-colors text-lg"
              >
                Ver tabela de preços
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="py-24 bg-[#2B2B2B]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[#CC0000] uppercase tracking-[0.3em] text-sm font-semibold mb-4">
              Quem somos
            </p>
            <h2
              className="text-4xl font-bold mb-6 uppercase text-[#F0F0F0]"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Uma história de <span className="text-[#CC0000]">confiança</span>
            </h2>
            <p className="text-[#A0A0A0] leading-relaxed text-lg">
              A Sorocaba Executivos nasceu da dedicação de Vagner, que começou como motorista de
              aplicativo em 2017 e conquistou a confiança dos passageiros pela direção cuidadosa e
              comprometimento. Hoje, contamos com uma rede de motoristas experientes e uma frota que
              preza pelo conforto, criada para atender exclusivamente a região de Sorocaba com
              agilidade, comodidade e segurança.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: "2017", label: "Fundada em" },
              { num: "100+", label: "Clientes ativos" },
              { num: "3", label: "Aeroportos atendidos" },
              { num: "5★", label: "Avaliação média" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-[#333333] border border-[#444444] rounded-lg p-6 text-center"
              >
                <p
                  className="text-4xl font-bold text-[#CC0000] mb-1"
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  {item.num}
                </p>
                <p className="text-[#A0A0A0] text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="py-24 bg-[#1E1E1E]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#CC0000] uppercase tracking-[0.3em] text-sm font-semibold mb-4">
              Diferenciais
            </p>
            <h2
              className="text-4xl font-bold uppercase text-[#F0F0F0]"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Por que nos <span className="text-[#CC0000]">escolher?</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {diferenciais.map((d) => (
              <div
                key={d.title}
                className="bg-[#2B2B2B] border border-[#444444] rounded-lg p-6 hover:border-[#CC0000] transition-colors group"
              >
                <d.icon
                  size={32}
                  className="text-[#CC0000] mb-4 group-hover:scale-110 transition-transform"
                />
                <h3 className="text-[#F0F0F0] font-semibold mb-2">{d.title}</h3>
                <p className="text-[#A0A0A0] text-sm leading-relaxed">{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className="py-24 bg-[#2B2B2B]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#CC0000] uppercase tracking-[0.3em] text-sm font-semibold mb-4">
              O que fazemos
            </p>
            <h2
              className="text-4xl font-bold uppercase text-[#F0F0F0]"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Nossos <span className="text-[#CC0000]">serviços</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {servicos.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-4 bg-[#333333] border border-[#444444] rounded-lg p-5 hover:border-[#CC0000] transition-colors"
              >
                <s.icon size={24} className="text-[#CC0000] shrink-0" />
                <span className="text-[#F0F0F0]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TABELA DE PREÇOS */}
      <section id="precos" className="py-24 bg-[#1E1E1E]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#CC0000] uppercase tracking-[0.3em] text-sm font-semibold mb-4">
              Transparência
            </p>
            <h2
              className="text-4xl font-bold uppercase text-[#F0F0F0]"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Tabela de <span className="text-[#CC0000]">trajetos</span>
            </h2>
          </div>
          <div className="bg-[#2B2B2B] border border-[#444444] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#CC0000]">
                  <th className="text-left text-white px-6 py-4 font-semibold">Trajeto</th>
                  <th className="text-right text-white px-6 py-4 font-semibold">Valor</th>
                </tr>
              </thead>
              <tbody>
                {precos.map((p, i) => (
                  <tr
                    key={p.trajeto}
                    className={`border-t border-[#444444] hover:bg-[#333333] transition-colors ${
                      i % 2 === 0 ? "bg-[#2B2B2B]" : "bg-[#272727]"
                    }`}
                  >
                    <td className="px-6 py-4 text-[#F0F0F0] text-sm">{p.trajeto}</td>
                    <td className="px-6 py-4 text-[#CC0000] font-semibold text-right text-sm">
                      {p.valor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[#A0A0A0] text-xs text-center">
            * Em caso de pernoite (Taubaté e São Vicente), será cobrado o valor da estadia com apresentação de comprovante, além do valor do retorno.
          </p>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-24 bg-[#2B2B2B]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#CC0000] uppercase tracking-[0.3em] text-sm font-semibold mb-4">
              Simples e rápido
            </p>
            <h2
              className="text-4xl font-bold uppercase text-[#F0F0F0]"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              Como <span className="text-[#CC0000]">funciona</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {passos.map((p) => (
              <div key={p.num} className="text-center">
                <div
                  className="text-7xl font-bold text-[#CC0000]/20 mb-4"
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  {p.num}
                </div>
                <h3
                  className="text-xl font-bold text-[#F0F0F0] mb-3 uppercase"
                  style={{ fontFamily: "var(--font-oswald)" }}
                >
                  {p.title}
                </h3>
                <p className="text-[#A0A0A0] leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 bg-[#CC0000]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-4 uppercase"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            Pronto para viajar com conforto?
          </h2>
          <p className="text-white/80 text-lg mb-10">
            Cadastre-se e solicite sua corrida agora.
          </p>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 bg-white text-[#CC0000] px-10 py-4 rounded font-bold text-lg hover:bg-[#F0F0F0] transition-colors"
          >
            <UserPlus size={20} />
            Criar minha conta
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
