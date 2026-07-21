import { useEffect, useMemo, useState } from "react";
import { setupPageProtection } from "./security";

const TARGET_DATE = new Date("2026-11-19T00:00:00-03:00").getTime();
const BASE_PRICE_LABEL = "R$19,90/mês";
const SYNC_CHECKOUT_LINK = "https://syncpay.link/tqzrAw";

const leakImages = [
  "/vazados/image1.png",
  "/vazados/image2.png",
  "/vazados/image3.png",
  "/vazados/image4.png",
  "/vazados/image5.png",
];

const featureCards = [
  {
    icon: "target",
    title: "GUIAS 100% FOCADOS E PRÁTICOS",
    text: "Nada de enrolação. Só o que funciona.",
  },
  {
    icon: "lock",
    title: "SEGREDOS QUE NINGUÉM VAI TE CONTAR",
    text: "Descubra o que os criadores escondem.",
  },
  {
    icon: "map",
    title: "MAPAS INTERATIVOS E DETALHADOS",
    text: "Explore cada canto antes de todo mundo.",
  },
];

const trustItems = [
  ["sync", "CONTEÚDO ATUALIZADO", "ATÉ O LANÇAMENTO"],
  ["shield", "ACESSO IMEDIATO", "APÓS O CADASTRO"],
  ["shield", "100% SEGURO", "SEUS DADOS PROTEGIDOS"],
  ["shield", "SUPORTE EXCLUSIVO", "PARA MEMBROS"],
];

const questions = [
  {
    eyebrow: "PERGUNTA 1 DE 4",
    question: "Há quanto tempo você está de olho nesse lançamento?",
    options: [
      { text: "Desde o primeiro trailer, anos atrás", score: { hunter: 2, hype: 1, cetico: 0 } },
      { text: "Desde que confirmaram a data", score: { hunter: 1, hype: 2, cetico: 0 } },
      { text: "Comecei a prestar atenção agora", score: { hunter: 0, hype: 1, cetico: 1 } },
      { text: "Só vou ligar quando sair mesmo", score: { hunter: 0, hype: 0, cetico: 2 } },
    ],
  },
  {
    eyebrow: "PERGUNTA 2 DE 4",
    question: "O que mais tira seu sono esperando?",
    options: [
      { text: "Perder um leak importante antes de virar notícia", score: { hunter: 2, hype: 0, cetico: 0 } },
      { text: "Ansiedade pura, já queria ter jogado", score: { hunter: 0, hype: 2, cetico: 0 } },
      { text: "Medo de pagar caro e não valer a pena", score: { hunter: 0, hype: 0, cetico: 2 } },
      { text: "Nada, só quero ser avisado quando sair de vez", score: { hunter: 1, hype: 1, cetico: 1 } },
    ],
  },
  {
    eyebrow: "PERGUNTA 3 DE 4",
    question: "Como você prefere descobrir novidades?",
    options: [
      { text: "Grupos e contas especializadas em leak", score: { hunter: 2, hype: 0, cetico: 0 } },
      { text: "Reagindo junto com a comunidade em tempo real", score: { hunter: 0, hype: 2, cetico: 0 } },
      { text: "Só o que sai em canal oficial mesmo", score: { hunter: 0, hype: 0, cetico: 2 } },
      { text: "Um resumo direto ao ponto, sem precisar caçar", score: { hunter: 1, hype: 1, cetico: 1 } },
    ],
  },
  {
    eyebrow: "PERGUNTA 4 DE 4",
    question: "Quando a pré-venda abrir, você vai...",
    options: [
      { text: "Comprar no primeiro minuto, sem pensar duas vezes", score: { hunter: 1, hype: 2, cetico: 0 } },
      { text: "Comprar assim que confirmar que vale a pena", score: { hunter: 2, hype: 0, cetico: 1 } },
      { text: "Esperar review sair pra decidir", score: { hunter: 0, hype: 0, cetico: 2 } },
      { text: "Só quero ser avisado na hora certa", score: { hunter: 1, hype: 1, cetico: 0 } },
    ],
  },
];

const results = {
  hunter: {
    label: "Hunter de Leak",
    description:
      "Você não espera a notícia chegar até você. Você já sabia antes de virar manchete. O plano entrega curadoria direta para cortar horas de procura.",
  },
  hype: {
    label: "Puro Hype",
    description:
      "Sua ansiedade pelo lançamento é genuína. Aqui ela vira vantagem: novidade, mapa e alerta importante no momento certo.",
  },
  cetico: {
    label: "Cético Estratégico",
    description:
      "Você quer prova antes de comprar hype. O acesso ajuda a separar detalhe útil de ruído, sem depender de maratona de vídeo.",
  },
};

const createInitialAnswers = () => ({
  hunter: 0,
  hype: 0,
  cetico: 0,
});

function trackPixelEvent(eventName, parameters) {
  if (typeof window.fbq === "function") {
    window.fbq("track", eventName, parameters);
  }
}

function trackPixelCustomEvent(eventName, parameters) {
  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", eventName, parameters);
  }
}

function getCountdownParts() {
  const diff = Math.max(0, TARGET_DATE - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days: String(days).padStart(3, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

function getTopProfile(answerTotals) {
  let top = "hunter";

  if (answerTotals.hype > answerTotals[top]) {
    top = "hype";
  }

  if (answerTotals.cetico > answerTotals[top]) {
    top = "cetico";
  }

  return top;
}

function Icon({ type }) {
  if (type === "lock") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M13 22h22v18H13z" />
        <path d="M17 22v-6a7 7 0 0 1 14 0v6" />
      </svg>
    );
  }

  if (type === "map") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="m5 12 11-5 16 6 11-5v28l-11 5-16-6-11 5z" />
        <path d="M16 7v28M32 13v28" />
      </svg>
    );
  }

  if (type === "sync") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M37 14a16 16 0 0 0-28 8" />
        <path d="M37 6v8h-8" />
        <path d="M11 34a16 16 0 0 0 28-8" />
        <path d="M11 42v-8h8" />
      </svg>
    );
  }

  if (type === "shield") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 5 39 11v11c0 10-6 17-15 21C15 39 9 32 9 22V11z" />
        <path d="m18 24 4 4 8-10" />
      </svg>
    );
  }

  if (type === "verified") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 4.5 28.1 8l5.4-.5 2.4 4.8 5 2.1-.7 5.4 3.3 4.2-3.3 4.2.7 5.4-5 2.1-2.4 4.8-5.4-.5-4.1 3.5-4.1-3.5-5.4.5-2.4-4.8-5-2.1.7-5.4L4.5 24l3.3-4.2-.7-5.4 5-2.1 2.4-4.8 5.4.5z" />
        <path d="m16.5 24.2 5.1 5.1 10.9-11.6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="12" />
      <circle cx="24" cy="24" r="3" />
      <path d="M24 3v9M24 36v9M3 24h9M36 24h9" />
    </svg>
  );
}

function LogoMark() {
  return (
    <div className="brand">
      <div className="brand-mark" aria-hidden="true">
        <img src="/favicon.jpg" alt="" />
      </div>
      <div className="brand-copy">
        <span>COMUNIDADE</span>
        <strong>DE GTA6</strong>
      </div>
    </div>
  );
}

export default function App() {
  const [stage, setStage] = useState("hero");
  const [countdown, setCountdown] = useState(getCountdownParts);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerTotals, setAnswerTotals] = useState(createInitialAnswers);
  const [resultKey, setResultKey] = useState("hunter");
  const [checkoutStatus, setCheckoutStatus] = useState("idle");

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCountdown(getCountdownParts());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => setupPageProtection(), []);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = stage === "quiz" ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const result = results[resultKey];

  const countdownItems = useMemo(
    () => [
      ["DIAS", countdown.days],
      ["HORAS", countdown.hours],
      ["MINUTOS", countdown.minutes],
      ["SEGUNDOS", countdown.seconds],
    ],
    [countdown],
  );

  const startQuiz = () => {
    trackPixelCustomEvent("QuizStarted");
    setStage("quiz");
    setCurrentQuestionIndex(0);
    setAnswerTotals(createInitialAnswers());
    setResultKey("hunter");
    setCheckoutStatus("idle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectOption = (optionIndex) => {
    const selectedOption = questions[currentQuestionIndex].options[optionIndex];

    setAnswerTotals((previousAnswers) => {
      const nextAnswers = {
        hunter: previousAnswers.hunter + selectedOption.score.hunter,
        hype: previousAnswers.hype + selectedOption.score.hype,
        cetico: previousAnswers.cetico + selectedOption.score.cetico,
      };

      const nextQuestionIndex = currentQuestionIndex + 1;

      if (nextQuestionIndex < questions.length) {
        setCurrentQuestionIndex(nextQuestionIndex);
      } else {
        const topProfile = getTopProfile(nextAnswers);
        setResultKey(topProfile);
        trackPixelEvent("Lead", { content_name: "QuizCompleted", profile: topProfile });
        setStage("result");
      }

      return nextAnswers;
    });
  };

  const goToCheckout = () => {
    setCheckoutStatus("loading");

    trackPixelEvent("InitiateCheckout", {
      content_name: "COMUNIDADE DE GTA6",
      currency: "BRL",
      value: 19.9,
    });

    window.location.assign(SYNC_CHECKOUT_LINK);
  };

  return (
    <>
      <div className="grain" />
      <div className="scan-line" />

      {stage === "hero" && (
        <main className="page-shell" id="inicio">
          <header className="topbar">
            <LogoMark />

            <nav className="nav-links" aria-label="Navegação principal">
              <a className="active" href="#inicio">INÍCIO</a>
              <a href="#receber">O QUE VOCÊ VAI RECEBER</a>
              <a href="#depoimentos">DEPOIMENTOS</a>
              <a href="#perguntas">PERGUNTAS</a>
            </nav>

            <button className="nav-cta" type="button" onClick={startQuiz}>
              DESCOBRIR MEU PERFIL <span className="cta-arrow" aria-hidden="true">→</span>
            </button>
          </header>

          <section className="hero-stage">
            <div className="hero-copy">
              <span className="eyebrow">CONTAGEM PARA 19.11.2026</span>
              <h1>
                <span className="white-line">PULE AS 100 HORAS</span>
                <span className="white-line">DE TENTATIVA E ERRO:</span>
                <span className="pink-line">SAIBA TUDO QUE 99%</span>
                <span className="pink-line">DOS JOGADORES SÓ</span>
                <span className="pink-line">IRÃO DESCOBRIR</span>
                <span className="pink-line">SEMANAS APÓS O</span>
                <span className="pink-line">LANÇAMENTO</span>
              </h1>
              <p className="sub">
                Melhores armas, segredos e mapas: você sabe antes do lançamento o que 99% só vai
                descobrir depois de assistir <strong>30 vídeos no YouTube.</strong>
              </p>

              <div className="insight-card">
                <div className="crown-box" aria-hidden="true">
                  <img src="/favicon.jpg" alt="" />
                </div>
                <p>
                  Enquanto <strong>99%</strong> assiste vídeo no YouTube, você já começa sabendo as
                  <strong> melhores armas, segredos, mapas</strong> e todos os detalhes.
                </p>
              </div>
            </div>

            <div className="hero-art" aria-label="Arte principal GTA6">
              <img src="/image.png" alt="Personagens em frente a carros policiais neon" />
            </div>

            <aside className="benefit-stack" id="receber">
              {featureCards.map((card) => (
                <article className="benefit-card" key={card.title}>
                  <div className="benefit-icon"><Icon type={card.icon} /></div>
                  <div>
                    <h2>{card.title}</h2>
                    <p>{card.text}</p>
                  </div>
                </article>
              ))}
            </aside>
          </section>

          <section className="leak-strip" aria-label="Imagens vazadas">
            {leakImages.map((src, index) => (
              <figure className="leak-thumb" key={src}>
                <img src={src} alt={`Vazado ${index + 1}`} />
              </figure>
            ))}
          </section>

          <section className="count-panel" aria-label="Contagem regressiva para 19 de novembro de 2026">
            <div className="count-title">
              <span />
              <strong>FALTAM</strong>
              <span />
            </div>

            <div className="countdown">
              {countdownItems.map(([label, value]) => (
                <div className="count-box" key={label}>
                  <div className="num">{value}</div>
                  <div className="lbl">{label}</div>
                </div>
              ))}
            </div>

            <button className="cta-btn" type="button" onClick={startQuiz}>
              DESCOBRIR MEU PERFIL <span className="cta-arrow" aria-hidden="true">→</span>
            </button>

            <p className="guarantee">
              <Icon type="verified" />
              Garanta acesso antecipado e esteja na frente de 99% dos jogadores.
            </p>
          </section>

          <footer className="trust-row">
            {trustItems.map(([icon, line1, line2]) => (
              <div className="trust-item" key={line1}>
                <Icon type={icon} />
                <p>
                  <span>{line1}</span>
                  <strong>{line2}</strong>
                </p>
              </div>
            ))}
          </footer>
        </main>
      )}

      {stage === "quiz" && currentQuestion && (
        <main className="flow-screen">
          <section className="flow-card">
            <LogoMark />
            <div className="progress-wrap">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <span className="q-eyebrow">{currentQuestion.eyebrow}</span>
            <h2>{currentQuestion.question}</h2>
            <div className="options-grid">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={option.text}
                  className="option"
                  type="button"
                  onClick={() => handleSelectOption(index)}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </section>
        </main>
      )}

      {stage === "result" && (
        <main className="flow-screen">
          <section className="flow-card result-card">
            <LogoMark />
            <span className="q-eyebrow">SEU PERFIL</span>
            <h2>
              Você é o <span>{result.label}</span>
            </h2>
            <p className="result-desc">{result.description}</p>

            <div className="offer-card">
              <span className="tag">VAGA LIMITADA</span>
              <div className="price">
                R$19,90<small>/mês</small>
              </div>
              <ul className="benefits-list">
                <li>Leaks curados e verificados, sem fake news.</li>
                <li>Contagem regressiva com marcos oficiais.</li>
                <li>Análises de mapa, armas, personagens e mecânicas.</li>
                <li>Alerta em tempo real quando a pré-venda abrir.</li>
              </ul>

              <div className="total-line">
                <span>Total do plano</span>
                <strong>{BASE_PRICE_LABEL}</strong>
              </div>

              <button
                className="cta-btn checkout-btn"
                type="button"
                onClick={goToCheckout}
                disabled={checkoutStatus === "loading"}
              >
                {checkoutStatus === "loading" ? "ABRINDO CHECKOUT..." : "QUERO ENTRAR AGORA →"}
              </button>
            </div>
          </section>
        </main>
      )}
    </>
  );
}
