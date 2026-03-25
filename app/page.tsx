"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import ScrollButton from "./components/ScrollButton";
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

// ── Traduções ──────────────────────────────────────────────

const content = {
  pt: {
    hero: {
      tag: "Transporte Executivo Premium",
      title: "Transporte",
      highlight: "Executivo",
      sub: "Segurança, conforto e pontualidade em cada viagem.",
      cta: "Solicitar uma corrida",
      precos: "Ver tabela de preços",
    },
    sobre: {
      tag: "Quem somos",
      title: "Uma história de",
      highlight: "confiança",
      text: "A Sorocaba Executivos nasceu da dedicação de Vagner, que começou como motorista de aplicativo em 2017 e conquistou a confiança dos passageiros pela direção cuidadosa e comprometimento. Hoje, contamos com uma rede de motoristas experientes e uma frota que preza pelo conforto, criada para atender exclusivamente a região de Sorocaba com agilidade, comodidade e segurança.",
      stats: [
        { num: "2017", label: "Fundada em" },
        { num: "100+", label: "Clientes ativos" },
        { num: "3", label: "Aeroportos atendidos" },
        { num: "5★", label: "Avaliação média" },
      ],
    },
    diferenciais: {
      tag: "Diferenciais",
      title: "Por que nos",
      highlight: "escolher?",
      items: [
        {
          title: "Veículos novos e revisados",
          text: "Frota bem equipada, higienizada e em plenas condições de uso. Carro Sedan e Van Executiva com ar condicionado.",
        },
        {
          title: "Motoristas habilitados e treinados",
          text: "Profissionais comprometidos com sua segurança, cordialidade, eficiência e discrição em cada trajeto.",
        },
        {
          title: "Tecnologia de última geração",
          text: "Equipamentos de ponta para fornecer ainda mais segurança e controle durante toda a viagem.",
        },
        {
          title: "Atendimento rápido",
          text: "Nossa central está pronta para atender sua demanda com agilidade e resolver qualquer situação.",
        },
      ],
    },
    servicos: {
      tag: "O que fazemos",
      title: "Nossos",
      highlight: "serviços",
      items: [
        "Transfer GRU, CGH e VCP",
        "Eventos corporativos e congressos",
        "Táxi executivo em Sorocaba",
        "Traslado para hotéis, spas e resorts",
        "Transporte de VIPs e palestrantes",
        "Transfer para todo o Estado de SP",
      ],
    },
    precos: {
      tag: "Transparência",
      title: "Tabela de",
      highlight: "trajetos",
      thTrajeto: "Trajeto",
      thValor: "Valor",
      nota: "* Em caso de pernoite (Taubaté e São Vicente), será cobrado o valor da estadia com apresentação de comprovante, além do valor do retorno.",
    },
    como: {
      tag: "Simples e rápido",
      title: "Como",
      highlight: "funciona",
      passos: [
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
      ],
    },
    cta: {
      title: "Pronto para viajar com conforto?",
      sub: "Cadastre-se e solicite sua corrida agora.",
      btn: "Criar minha conta",
    },
  },

  en: {
    hero: {
      tag: "Premium Executive Transport",
      title: "Executive",
      highlight: "Transport",
      sub: "Safety, comfort and punctuality on every trip.",
      cta: "Request a ride",
      precos: "View price list",
    },
    sobre: {
      tag: "About us",
      title: "A story of",
      highlight: "trust",
      text: "Sorocaba Executivos was born from Vagner's dedication, who started as a rideshare driver in 2017 and earned passengers' trust through careful driving and commitment. Today, we have a network of experienced drivers and a comfort-focused fleet, built to exclusively serve the Sorocaba region with agility, convenience and safety.",
      stats: [
        { num: "2017", label: "Founded in" },
        { num: "100+", label: "Active clients" },
        { num: "3", label: "Airports served" },
        { num: "5★", label: "Average rating" },
      ],
    },
    diferenciais: {
      tag: "Highlights",
      title: "Why",
      highlight: "choose us?",
      items: [
        {
          title: "New and serviced vehicles",
          text: "Well-equipped, sanitized fleet in full working condition. Sedan and Executive Van with air conditioning.",
        },
        {
          title: "Licensed and trained drivers",
          text: "Professionals committed to your safety, courtesy, efficiency and discretion on every route.",
        },
        {
          title: "Latest generation technology",
          text: "State-of-the-art equipment to provide even more safety and control throughout the journey.",
        },
        {
          title: "Fast service",
          text: "Our team is ready to handle your request quickly and resolve any situation.",
        },
      ],
    },
    servicos: {
      tag: "What we do",
      title: "Our",
      highlight: "services",
      items: [
        "Transfer GRU, CGH and VCP",
        "Corporate events and congresses",
        "Executive taxi in Sorocaba",
        "Transfer to hotels, spas and resorts",
        "VIP and speaker transportation",
        "Transfer throughout São Paulo State",
      ],
    },
    precos: {
      tag: "Transparency",
      title: "Price",
      highlight: "list",
      thTrajeto: "Route",
      thValor: "Price",
      nota: "* Overnight stays (Taubaté and São Vicente) will be charged separately with proof of accommodation, plus the return fare.",
    },
    como: {
      tag: "Simple and fast",
      title: "How it",
      highlight: "works",
      passos: [
        {
          num: "01",
          title: "Create your account",
          text: "Quick registration with name, email and phone. Ready to request your first ride.",
        },
        {
          num: "02",
          title: "Request your ride",
          text: "Enter origin, destination and time. Choose from frequent destinations or enter a new address.",
        },
        {
          num: "03",
          title: "Track in real time",
          text: "Receive confirmation via WhatsApp and track your driver until arrival.",
        },
      ],
    },
    cta: {
      title: "Ready to travel in comfort?",
      sub: "Sign up and request your ride now.",
      btn: "Create my account",
    },
  },
};

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

const servicoIcons = [Plane, Building2, Car, MapPin, Star, CheckCircle];
const diferencialIcons = [Car, Shield, Zap, Headphones];

type Lang = "pt" | "en";

export default function Home() {
  const [lang, setLang] = useState<Lang>("pt");
  const t = content[lang];

  return (
    <>
      <Navbar lang={lang} />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E1E1E] via-[#2B2B2B] to-[#1E1E1E]" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#CC0000]/5 blur-3xl" />

        {/* Toggle PT / EN */}
        <div className="absolute top-24 right-6 z-10 flex items-center gap-1 bg-[#2B2B2B] border border-[#444444] rounded p-1">
          <button
            onClick={() => setLang("pt")}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              lang === "pt"
                ? "bg-[#CC0000] text-white"
                : "text-[#A0A0A0] hover:text-[#F0F0F0]"
            }`}
          >
            PT
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              lang === "en"
                ? "bg-[#CC0000] text-white"
                : "text-[#A0A0A0] hover:text-[#F0F0F0]"
            }`}
          >
            EN
          </button>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-[#CC0000] uppercase tracking-[0.3em] text-sm font-semibold mb-4">
              {t.hero.tag}
            </p>
            <h1
              className="text-5xl md:text-7xl font-bold leading-tight mb-6 uppercase text-[#F0F0F0]"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              {t.hero.title} <span className="text-[#CC0000]">{t.hero.highlight}</span>
            </h1>
            <p className="text-[#A0A0A0] text-xl mb-10 leading-relaxed">{t.hero.sub}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/cadastro"
                className="bg-[#CC0000] text-white px-8 py-4 rounded text-center font-semibold hover:bg-[#E50000] transition-colors text-lg"
              >
                {t.hero.cta}
              </Link>
              <ScrollButton
                targetId="precos"
                className="border border-[#444444] text-[#F0F0F0] px-8 py-4 rounded text-center font-semibold hover:border-[#CC0000] transition-colors text-lg"
              >
                {t.hero.precos}
              </ScrollButton>
            </div>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="py-24 bg-[#2B2B2B]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[#CC0000] uppercase tracking-[0.3em] text-sm font-semibold mb-4">
              {t.sobre.tag}
            </p>
            <h2
              className="text-4xl font-bold mb-6 uppercase text-[#F0F0F0]"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              {t.sobre.title} <span className="text-[#CC0000]">{t.sobre.highlight}</span>
            </h2>
            <p className="text-[#A0A0A0] leading-relaxed text-lg">{t.sobre.text}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {t.sobre.stats.map((item) => (
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
              {t.diferenciais.tag}
            </p>
            <h2
              className="text-4xl font-bold uppercase text-[#F0F0F0]"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              {t.diferenciais.title} <span className="text-[#CC0000]">{t.diferenciais.highlight}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.diferenciais.items.map((d, i) => {
              const Icon = diferencialIcons[i];
              return (
                <div
                  key={d.title}
                  className="bg-[#2B2B2B] border border-[#444444] rounded-lg p-6 hover:border-[#CC0000] transition-colors group"
                >
                  <Icon size={32} className="text-[#CC0000] mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-[#F0F0F0] font-semibold mb-2">{d.title}</h3>
                  <p className="text-[#A0A0A0] text-sm leading-relaxed">{d.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className="py-24 bg-[#2B2B2B]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#CC0000] uppercase tracking-[0.3em] text-sm font-semibold mb-4">
              {t.servicos.tag}
            </p>
            <h2
              className="text-4xl font-bold uppercase text-[#F0F0F0]"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              {t.servicos.title} <span className="text-[#CC0000]">{t.servicos.highlight}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.servicos.items.map((label, i) => {
              const Icon = servicoIcons[i];
              return (
                <div
                  key={label}
                  className="flex items-center gap-4 bg-[#333333] border border-[#444444] rounded-lg p-5 hover:border-[#CC0000] transition-colors"
                >
                  <Icon size={24} className="text-[#CC0000] shrink-0" />
                  <span className="text-[#F0F0F0]">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TABELA DE PREÇOS */}
      <section id="precos" className="py-24 bg-[#1E1E1E]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#CC0000] uppercase tracking-[0.3em] text-sm font-semibold mb-4">
              {t.precos.tag}
            </p>
            <h2
              className="text-4xl font-bold uppercase text-[#F0F0F0]"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              {t.precos.title} <span className="text-[#CC0000]">{t.precos.highlight}</span>
            </h2>
          </div>
          <div className="bg-[#2B2B2B] border border-[#444444] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#CC0000]">
                  <th className="text-left text-white px-6 py-4 font-semibold">{t.precos.thTrajeto}</th>
                  <th className="text-right text-white px-6 py-4 font-semibold">{t.precos.thValor}</th>
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
                    <td className="px-6 py-4 text-[#CC0000] font-semibold text-right text-sm">{p.valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[#A0A0A0] text-xs text-center">{t.precos.nota}</p>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-24 bg-[#2B2B2B]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#CC0000] uppercase tracking-[0.3em] text-sm font-semibold mb-4">
              {t.como.tag}
            </p>
            <h2
              className="text-4xl font-bold uppercase text-[#F0F0F0]"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              {t.como.title} <span className="text-[#CC0000]">{t.como.highlight}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.como.passos.map((p) => (
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
            {t.cta.title}
          </h2>
          <p className="text-white/80 text-lg mb-10">{t.cta.sub}</p>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 bg-white text-[#CC0000] px-10 py-4 rounded font-bold text-lg hover:bg-[#F0F0F0] transition-colors"
          >
            <UserPlus size={20} />
            {t.cta.btn}
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
