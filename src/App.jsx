import { useEffect, useState } from "react";
import { setupPageProtection } from "./security";

const TARGET_DATE = new Date("2026-11-19T00:00:00-03:00").getTime();
const BASE_PRICE_LABEL = "R$14,90/mês";
const BUMP_PRICE_LABEL = "R$14,90/mês + R$9,90";
const BASE_CHECKOUT_LINK = "SEU_LINK_KIWIFY_AQUI";
const BUMP_CHECKOUT_LINK = "SEU_LINK_KIWIFY_COM_BUMP_AQUI";

const questions = [
  {
    eyebrow: "PERGUNTA 1 DE 4",
    question: "Há quanto tempo você tá de olho nesse lançamento?",
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
      "Você não espera a notícia chegar até você — você já sabia antes de virar manchete. O problema é que, sem curadoria, isso significa horas garimpando grupo, perfil e fórum atrás de informação confiável no meio de um monte de fake.",
  },
  hype: {
    label: "Puro Hype",
    description:
      "Sua ansiedade pelo lançamento é genuína e contagiante — só falta canalizar isso em um lugar que te entrega a dose certa de novidade sem você precisar procurar. Sem perder o momento de nenhum anúncio.",
  },
  cetico: {
    label: "Cético Estratégico",
    description:
      "Você não compra hype fácil — quer prova antes de se empolgar. Isso te protege de decepção, mas também te deixa por fora até informação confiável demorar demais pra chegar até você.",
  },
};

const createInitialAnswers = () => ({
  hunter: 0,
  hype: 0,
  cetico: 0,
});

function getCountdownParts() {
  const diff = Math.max(0, TARGET_DATE - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days: String(days),
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

export default function App() {
  const [stage, setStage] = useState("hero");
  const [countdown, setCountdown] = useState(getCountdownParts);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerTotals, setAnswerTotals] = useState(createInitialAnswers);
  const [resultKey, setResultKey] = useState("hunter");
  const [hasPlaylistBump, setHasPlaylistBump] = useState(false);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCountdown(getCountdownParts());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => setupPageProtection(), []);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = stage === "quiz" ? (currentQuestionIndex / questions.length) * 100 : 0;
  const totalLabel = hasPlaylistBump ? BUMP_PRICE_LABEL : BASE_PRICE_LABEL;
  const result = results[resultKey];

  const startQuiz = () => {
    setStage("quiz");
    setCurrentQuestionIndex(0);
    setAnswerTotals(createInitialAnswers());
    setResultKey("hunter");
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
        setResultKey(getTopProfile(nextAnswers));
        setStage("result");
      }

      return nextAnswers;
    });
  };

  const goToCheckout = () => {
    const targetLink = hasPlaylistBump ? BUMP_CHECKOUT_LINK : BASE_CHECKOUT_LINK;
    window.open(targetLink, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div className="grain" />
      <div className="glitch-line" />

      {stage === "hero" && (
        <section className="hero" id="hero">
          <span className="eyebrow">CONTAGEM PARA 19.11.2026</span>
          <h1>
            ENQUANTO
            <br />
            TODO MUNDO ESPERA,
            <br />
            VOCÊ JÁ SABE.
          </h1>
          <p className="sub">
            Trailer novo, pré-venda, mapa, teorias — a temporada mais barulhenta do universo gamer está
            começando agora. A pergunta é: você vai descobrir tudo com atraso, ou antes de todo mundo?
          </p>

          <div className="countdown" aria-label="Contagem regressiva para 19 de novembro de 2026">
            <div className="count-box">
              <div className="num">{countdown.days}</div>
              <div className="lbl">dias</div>
            </div>
            <div className="count-box">
              <div className="num">{countdown.hours}</div>
              <div className="lbl">horas</div>
            </div>
            <div className="count-box">
              <div className="num">{countdown.minutes}</div>
              <div className="lbl">min</div>
            </div>
            <div className="count-box">
              <div className="num">{countdown.seconds}</div>
              <div className="lbl">seg</div>
            </div>
          </div>

          <button className="cta-btn" type="button" onClick={startQuiz}>
            Descobrir meu perfil →
          </button>
          <div className="scroll-hint">30 segundos · sem cadastro</div>
        </section>
      )}

      {stage === "quiz" && currentQuestion && (
        <section className="quiz-section active" id="quiz">
          <div className="progress-wrap">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="quiz-card">
            <span className="q-eyebrow">{currentQuestion.eyebrow}</span>
            <h2>{currentQuestion.question}</h2>
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
      )}

      {stage === "result" && (
        <section className="result-section active" id="result">
          <span className="eyebrow">SEU PERFIL</span>
          <h2 className="result-title">
            Você é o <span>{result.label}</span>
          </h2>
          <p className="result-desc">{result.description}</p>

          <div className="offer-card">
            <span className="tag">VAGA LIMITADA</span>
            <div className="price">
              R$14,90<small>/mês</small>
            </div>
            <ul className="benefits">
              <li>Leaks curados e verificados, sem fake news, direto no WhatsApp</li>
              <li>Contagem regressiva com marcos oficiais (trailer, pré-venda, preço)</li>
              <li>Análises de mapa, personagens e mecânicas assim que saem</li>
              <li>Alerta em tempo real quando a pré-venda abrir — para não perder o lançamento</li>
              <li>Cancele quando quiser, sem fidelidade</li>
            </ul>

            <label className="bump" htmlFor="bump-playlist">
              <input
                id="bump-playlist"
                type="checkbox"
                checked={hasPlaylistBump}
                onChange={(event) => setHasPlaylistBump(event.target.checked)}
              />
              <div>
                <div className="bump-title">+ Adicionar Miami Nights</div>
                <div className="bump-desc">
                  Playlist curada com o clima de Vice City — synthwave, funk e clássicos 80s/90s, pronta
                  pro seu Spotify. Pagamento único, é sua pra sempre.
                </div>
              </div>
              <div className="bump-price">+R$9,90</div>
            </label>

            <div className="total-line">
              <span>Total hoje</span>
              <span className="total-value">{totalLabel}</span>
            </div>

            <button className="cta-btn checkout-btn" type="button" onClick={goToCheckout}>
              Quero entrar no VICE FILES
            </button>
          </div>

          <p className="fine-print">
            VICE FILES é um clube informativo independente de fãs. Não possui qualquer vínculo, patrocínio
            ou afiliação com a Rockstar Games ou a Take-Two Interactive. Conteúdo baseado em fontes
            públicas e informações oficiais divulgadas pela desenvolvedora. A playlist Miami Nights é uma
            seleção musical inspirada na estética da franquia, sem uso de trilha sonora oficial ou não
            divulgada do jogo.
          </p>
        </section>
      )}
    </>
  );
}
