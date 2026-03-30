"use client";

import Link from "next/link";
import { useLang } from "./hooks/useLang";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LangDropdown from "./components/LangDropdown";
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
  Bus,
  Globe,
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
    },
    sobre: {
      tag: "Quem somos",
      title: "Uma história de",
      highlight: "confiança",
      text: "A Sorocaba Executivos nasceu da dedicação de Vagner, que começou como motorista de aplicativo em 2017 e conquistou a confiança dos passageiros pela direção cuidadosa e comprometimento. Hoje, contamos com uma rede de motoristas experientes e uma frota que preza pelo conforto, criada para atender exclusivamente a região de Sorocaba com agilidade, comodidade e segurança.",
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
        {
          title: "Atendemos com todos os veículos",
          text: "Carros, vans, micro-ônibus, ônibus executivos, aviões de pequeno porte e helicópteros para cada necessidade.",
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
        "Transfer em todo o território nacional",
      ],
    },
    frota: {
      tag: "Nossa Frota",
      title: "Veículos para",
      highlight: "cada necessidade",
      sub: "Uma gama completa de veículos para atender todas as suas demandas, de transferências individuais a grupos e viagens de longa distância.",
      items: [
        { title: "Carros Executivos", desc: "Sedãs de luxo com motoristas para transfers e viagens executivas." },
        { title: "Vans Executivas", desc: "Conforto e espaço para grupos, com Wi-Fi e ar-condicionado." },
        { title: "Micro-Ônibus", desc: "Transporte para grupos de médio porte, ideal para eventos corporativos." },
        { title: "Ônibus Executivos", desc: "Viagens em grupo com máximo conforto, poltronas leito e entretenimento." },
        { title: "Táxi Aéreo — Aviões", desc: "Voe de forma rápida e segura para destinos nacionais com nossa frota de jatos." },
        { title: "Táxi Aéreo — Helicóptero", desc: "Agilidade urbana e transferências rápidas entre aeroportos e pontos estratégicos." },
      ],
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
    },
    sobre: {
      tag: "About us",
      title: "A story of",
      highlight: "trust",
      text: "Sorocaba Executivos was born from Vagner's dedication, who started as a rideshare driver in 2017 and earned passengers' trust through careful driving and commitment. Today, we have a network of experienced drivers and a comfort-focused fleet, built to exclusively serve the Sorocaba region with agility, convenience and safety.",
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
        {
          title: "We serve with all vehicle types",
          text: "Cars, vans, minibuses, executive coaches, small aircraft and helicopters for every need.",
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
        "Transfer across the entire national territory",
      ],
    },
    frota: {
      tag: "Our Fleet",
      title: "Vehicles for",
      highlight: "every need",
      sub: "A complete range of vehicles to meet all your demands, from individual transfers to groups and long-distance trips.",
      items: [
        { title: "Executive Cars", desc: "Luxury sedans with bilingual drivers for transfers and executive trips." },
        { title: "Executive Vans", desc: "Comfort and space for groups, with Wi-Fi and air conditioning." },
        { title: "Mini Coach", desc: "Mid-size group transport, ideal for corporate events and outings." },
        { title: "Executive Bus", desc: "Group trips with maximum comfort, reclining seats and entertainment." },
        { title: "Air Taxi — Aircraft", desc: "Fast and safe flights to national destinations with our jet fleet." },
        { title: "Air Taxi — Helicopter", desc: "Urban agility and quick transfers between airports and strategic points." },
      ],
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

  es: {
    hero: {
      tag: "Transporte Ejecutivo Premium",
      title: "Transporte",
      highlight: "Ejecutivo",
      sub: "Seguridad, confort y puntualidad en cada viaje.",
      cta: "Solicitar un servicio",
    },
    sobre: {
      tag: "Quiénes somos",
      title: "Una historia de",
      highlight: "confianza",
      text: "Sorocaba Executivos nació de la dedicación de Vagner, quien comenzó como conductor de aplicación en 2017 y se ganó la confianza de los pasajeros por su manejo cuidadoso y compromiso. Hoy contamos con una red de conductores experimentados y una flota orientada al confort, creada para atender exclusivamente la región de Sorocaba con agilidad, comodidad y seguridad.",
    },
    diferenciais: {
      tag: "Diferenciales",
      title: "¿Por qué",
      highlight: "elegirnos?",
      items: [
        {
          title: "Vehículos nuevos y revisados",
          text: "Flota bien equipada, higienizada y en plenas condiciones de uso. Sedán y Van Ejecutiva con aire acondicionado.",
        },
        {
          title: "Conductores habilitados y capacitados",
          text: "Profesionales comprometidos con su seguridad, cordialidad, eficiencia y discreción en cada trayecto.",
        },
        {
          title: "Tecnología de última generación",
          text: "Equipos de punta para brindar aún más seguridad y control durante todo el viaje.",
        },
        {
          title: "Atención rápida",
          text: "Nuestro equipo está listo para atender su demanda con agilidad y resolver cualquier situación.",
        },
        {
          title: "Atendemos con todos los vehículos",
          text: "Autos, vans, microbuses, autobuses ejecutivos, aviones pequeños y helicópteros para cada necesidad.",
        },
      ],
    },
    servicos: {
      tag: "Lo que hacemos",
      title: "Nuestros",
      highlight: "servicios",
      items: [
        "Transfer GRU, CGH y VCP",
        "Eventos corporativos y congresos",
        "Taxi ejecutivo en Sorocaba",
        "Traslado a hoteles, spas y resorts",
        "Transporte de VIPs y conferencistas",
        "Transfer en todo el territorio nacional",
      ],
    },
    frota: {
      tag: "Nuestra Flota",
      title: "Vehículos para",
      highlight: "cada necesidad",
      sub: "Una gama completa de vehículos para satisfacer todas sus demandas, desde transfers individuales hasta grupos y viajes de larga distancia.",
      items: [
        { title: "Autos Ejecutivos", desc: "Sedanes de lujo con conductores para transfers y viajes ejecutivos." },
        { title: "Vans Ejecutivas", desc: "Confort y espacio para grupos, con Wi-Fi y aire acondicionado." },
        { title: "Microbús", desc: "Transporte para grupos medianos, ideal para eventos corporativos." },
        { title: "Autobús Ejecutivo", desc: "Viajes en grupo con máximo confort, asientos reclinables y entretenimiento." },
        { title: "Taxi Aéreo — Aviones", desc: "Vuelos rápidos y seguros a destinos nacionales con nuestra flota de jets." },
        { title: "Taxi Aéreo — Helicóptero", desc: "Agilidad urbana y transfers rápidos entre aeropuertos y puntos estratégicos." },
      ],
    },
    como: {
      tag: "Simple y rápido",
      title: "Cómo",
      highlight: "funciona",
      passos: [
        {
          num: "01",
          title: "Cree su cuenta",
          text: "Registro rápido con nombre, correo y teléfono. Listo para solicitar su primer servicio.",
        },
        {
          num: "02",
          title: "Solicite su servicio",
          text: "Ingrese origen, destino y horario. Elija entre destinos frecuentes o ingrese una nueva dirección.",
        },
        {
          num: "03",
          title: "Siga en tiempo real",
          text: "Reciba confirmación por WhatsApp y siga al conductor hasta su llegada.",
        },
      ],
    },
    cta: {
      title: "¿Listo para viajar con confort?",
      sub: "Regístrese y solicite su servicio ahora.",
      btn: "Crear mi cuenta",
    },
  },
};


const servicoIcons = [Plane, Building2, Car, MapPin, Star, Globe];
const diferencialIcons = [Car, Shield, Zap, Headphones, Bus];
const frotaPhotos = [
  "/2025-09-2-1024x512.jpg",
  "/Mercedes-Benz-Sprinter-de-luxo-1.png",
  "/Gemini_Generated_Image_6x09fa6x09fa6x09.png",
  "/onibus-46lugares-Irizar-i6-Efficient-768x512.png",
  "/Taxi-principal.jpg",
  "/taxi-aereo-de-helicoptero-preco-jpg-01-1.jpg",
];
const frotaPositions = [
  "center center",
  "center center",
  "center 60%",
  "center center",
  "center center",
  "center center",
];

export default function Home() {
  const { lang, setLang } = useLang();
  const t = content[lang];

  return (
    <>
      <Navbar lang={lang} />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Foto de fundo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/toyota-corolla-hibrido-6-1.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-[#0A0A0A]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/80 via-[#0A0A0A]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent" />

        <div className="absolute top-24 right-6 z-10">
          <LangDropdown lang={lang} setLang={setLang} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20">
          <div className="max-w-2xl">
            <p className="text-[#CC0000] uppercase tracking-[0.3em] text-sm font-semibold mb-4">
              {t.hero.tag}
            </p>
            <h1
              className="text-5xl md:text-7xl font-bold leading-tight mb-6 uppercase text-[#F0F0F0]"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              {t.hero.title}<br /><span className="text-[#CC0000]">{t.hero.highlight}</span>
            </h1>
            <p className="text-[#C0C0C0] text-xl mb-10 leading-relaxed">{t.hero.sub}</p>
            <Link
              href="/cadastro"
              className="inline-block bg-[#CC0000] text-white px-8 py-4 rounded font-semibold hover:bg-[#E50000] transition-colors text-lg"
            >
              {t.hero.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="py-24 bg-[#DEDEDE]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#CC0000] uppercase tracking-[0.3em] text-sm font-semibold mb-4">
              {t.diferenciais.tag}
            </p>
            <h2
              className="text-4xl font-bold uppercase text-[#1A1A1A]"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              {t.diferenciais.title} <span className="text-[#CC0000]">{t.diferenciais.highlight}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.diferenciais.items.slice(0, 3).map((d, i) => {
              const Icon = diferencialIcons[i];
              return (
                <div key={d.title} className="bg-[#F0F0F0] border border-[#CCCCCC] rounded-lg p-6 hover:border-[#CC0000] transition-colors group shadow-sm">
                  <Icon size={32} className="text-[#CC0000] mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-[#1A1A1A] font-semibold mb-2">{d.title}</h3>
                  <p className="text-[#666666] text-sm leading-relaxed">{d.text}</p>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 lg:w-2/3 lg:mx-auto">
            {t.diferenciais.items.slice(3).map((d, i) => {
              const Icon = diferencialIcons[3 + i];
              return (
                <div key={d.title} className="bg-[#F0F0F0] border border-[#CCCCCC] rounded-lg p-6 hover:border-[#CC0000] transition-colors group shadow-sm">
                  <Icon size={32} className="text-[#CC0000] mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-[#1A1A1A] font-semibold mb-2">{d.title}</h3>
                  <p className="text-[#666666] text-sm leading-relaxed">{d.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className="py-24 bg-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#CC0000] uppercase tracking-[0.3em] text-sm font-semibold mb-4">
              {t.servicos.tag}
            </p>
            <h2
              className="text-4xl font-bold uppercase text-[#1A1A1A]"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              {t.servicos.title} <span className="text-[#CC0000]">{t.servicos.highlight}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.servicos.items.map((label, i) => {
              const Icon = servicoIcons[i];
              return (
                <div key={label} className="flex items-center gap-4 bg-[#F0F0F0] border border-[#CCCCCC] rounded-lg p-5 hover:border-[#CC0000] transition-colors shadow-sm">
                  <Icon size={24} className="text-[#CC0000] shrink-0" />
                  <span className="text-[#1A1A1A]">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FROTA */}
      <section id="frota" className="bg-[#1A1A1A]">
        {/* Banner de destaque */}
        <div className="relative h-[460px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/toyota-corolla-hibrido-6-1.png"
            alt="Frota Sorocaba Executivos"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />

          {/* Conteúdo sobreposto */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-5 px-6">
            <div className="max-w-2xl">
              <p className="text-[#CC0000] uppercase tracking-[0.3em] text-xs font-semibold mb-3">{t.frota.tag}</p>
              <h2
                className="text-4xl md:text-5xl font-bold uppercase text-[#F0F0F0] leading-tight mb-3"
                style={{ fontFamily: "var(--font-oswald)" }}
              >
                {t.frota.title}<br /><span className="text-[#CC0000]">{t.frota.highlight}</span>
              </h2>
              <p className="text-[#A0A0A0] text-sm leading-relaxed">{t.frota.sub}</p>
            </div>
          </div>
        </div>

        {/* Grid de veículos */}
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.frota.items.map((v, i) => (
              <div
                key={v.title}
                className="group bg-[#222222] border border-[#333333] rounded-xl overflow-hidden hover:border-[#CC0000] transition-colors"
              >
                <div className="relative h-48 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={frotaPhotos[i]}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    style={{ objectPosition: frotaPositions[i] }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#222222] via-transparent to-transparent" />
                </div>
                <div className="px-5 py-4 border-t border-[#2E2E2E]">
                  <h3
                    className="text-base font-bold text-[#F0F0F0] uppercase mb-1"
                    style={{ fontFamily: "var(--font-oswald)" }}
                  >
                    {v.title}
                  </h3>
                  <p className="text-[#777777] text-xs leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-24 bg-[#DEDEDE]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#CC0000] uppercase tracking-[0.3em] text-sm font-semibold mb-4">
              {t.como.tag}
            </p>
            <h2
              className="text-4xl font-bold uppercase text-[#1A1A1A]"
              style={{ fontFamily: "var(--font-oswald)" }}
            >
              {t.como.title} <span className="text-[#CC0000]">{t.como.highlight}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.como.passos.map((p) => (
              <div key={p.num} className="text-center">
                <div className="text-7xl font-bold text-[#1A1A1A]/10 mb-4" style={{ fontFamily: "var(--font-oswald)" }}>
                  {p.num}
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-3 uppercase" style={{ fontFamily: "var(--font-oswald)" }}>
                  {p.title}
                </h3>
                <p className="text-[#555555] leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="py-24 bg-[#E8E8E8]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[#CC0000] uppercase tracking-[0.3em] text-sm font-semibold mb-4">
            {t.sobre.tag}
          </p>
          <h2
            className="text-4xl font-bold mb-6 uppercase text-[#1A1A1A]"
            style={{ fontFamily: "var(--font-oswald)" }}
          >
            {t.sobre.title} <span className="text-[#CC0000]">{t.sobre.highlight}</span>
          </h2>
          <p className="text-[#555555] leading-relaxed text-lg">{t.sobre.text}</p>
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
