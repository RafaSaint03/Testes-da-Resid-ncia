// ANIMA GRÁFICO INICIAL - Index 
function movimentoReduzidoAtivo() {
  return (
    document.body.classList.contains("a11y-reduced-motion") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function animarHeroDashboard() {
  const saldoEl = document.querySelector(".patrimonio-value");
  const linhaEl = document.querySelector(".chart-line path");
  if (!saldoEl) return;

  const saldoAlvo = 842390.18;
  if (movimentoReduzidoAtivo()) {
    saldoEl.textContent = saldoAlvo.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return;
  }

  const duracao = 3200; // 3.2 segundos 
  const inicio = performance.now();

  // Prepara a linha do SVG para começar invisível e ir se desenhando
  let comprimentoLinha = 0;
  if (linhaEl) {
    comprimentoLinha = linhaEl.getTotalLength();
    linhaEl.style.strokeDasharray = comprimentoLinha;
    linhaEl.style.strokeDashoffset = comprimentoLinha;
  }

  function atualizar(agora) {
    const progresso = Math.min((agora - inicio) / duracao, 1);
    const suavizado = 1 - Math.pow(1 - progresso, 3);

    // 1. Sobe o patrimônio formatado em R$
    const valorAtual = saldoAlvo * suavizado;
    saldoEl.textContent = valorAtual.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    // 2. Desenha a linha rosa (#FF65C3) na mesma proporção
    if (comprimentoLinha > 0) {
      linhaEl.style.strokeDashoffset = comprimentoLinha * (1 - suavizado);
    }

    if (progresso < 1) {
      requestAnimationFrame(atualizar);
    }
  }

  requestAnimationFrame(atualizar);
}

window.addEventListener("DOMContentLoaded", animarHeroDashboard);


// ANIMA E ATUALIZA HORA ATUAL - Index
const updateEl = document.querySelector(".update-time");
if (updateEl) {
  const agora = new Date();
  const hora = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  updateEl.textContent = `Atualizado hoje, às ${hora}`;
}


// ANIMA NÚMEROS DE CLIENTE - Index
let jaAnimou = false;

function verificarAnimacaoNumeros() { 
  const secao = document.querySelector(".metrics-section");
  if (!secao || jaAnimou) return;

  const reduzirMovimento = movimentoReduzidoAtivo();
  if (reduzirMovimento || secao.getBoundingClientRect().top < window.innerHeight - 80) {
    jaAnimou = true;

    document.querySelectorAll(".num").forEach(el => {
      const max = parseFloat(el.dataset.max);
      const isDecimal = max % 1 !== 0;
      const textoFinal = (isDecimal ? max.toFixed(1) : Math.round(max))
        .toString()
        .replace(".", ",");

      if (reduzirMovimento) {
        el.textContent = textoFinal;
        return;
      }

      const duracao = 2000; // 1.5 segundos
      const inicio = performance.now();

      function atualizar(agora) {
        const progresso = Math.min((agora - inicio) / duracao, 1);
        // Curva suave: dispara rápido e desacelera perto do fim
        const suavizado = 1 - Math.pow(1 - progresso, 3);
        const valor = max * suavizado;

        el.textContent = (isDecimal ? valor.toFixed(1) : Math.round(valor))
          .toString()
          .replace(".", ",");

        if (progresso < 1) {
          requestAnimationFrame(atualizar);
        }
      }

      requestAnimationFrame(atualizar);
    });
  }
}

window.addEventListener("scroll", verificarAnimacaoNumeros);
window.addEventListener("DOMContentLoaded", verificarAnimacaoNumeros);


// REVELA TEXTOS INFORMATIVOS DE LOGIN E CADASTRO
function animarTextosIntro() {
  const elementos = document.querySelectorAll("[data-intro]");
  const movimentoReduzido = movimentoReduzidoAtivo();

  if (
    movimentoReduzido ||
    !elementos.length ||
    !("IntersectionObserver" in window) ||
    !Element.prototype.animate
  ) {
    return;
  }

  const animar = elemento => {
    const atraso = Number(elemento.dataset.introDelay) || 0;
    const animacao = elemento.animate(
      [
        { opacity: 0, transform: "translateY(12px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 800,
        delay: Math.max(0, atraso),
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both",
      }
    );

    animacao.onfinish = () => animacao.cancel();
  };

  const observador = new IntersectionObserver(
    entradas => {
      entradas.forEach(entrada => {
        if (!entrada.isIntersecting) return;

        animar(entrada.target);
        observador.unobserve(entrada.target);
      });
    },
    { threshold: 0.15 }
  );

  elementos.forEach(elemento => {
    const posicao = elemento.getBoundingClientRect();
    const visivel = posicao.top < window.innerHeight * 0.9 && posicao.bottom > 0;

    if (visivel) {
      animar(elemento);
    } else {
      observador.observe(elemento);
    }
  });
}

animarTextosIntro();


// REVELA CARTÕES E PAINÉIS DOS DASHBOARDS
function animarCartoesDashboard() {
  const seletorCartoes = [
    ".metric-card-dark",
    ".metric-card-light",
    ".chart-box-main",
    ".allocation-box",
    ".dist-box",
    ".positions-table-box",
    ".inv-calc-card",
  ].join(", ");
  const cartoes = document.querySelectorAll(seletorCartoes);
  const movimentoReduzido = movimentoReduzidoAtivo();

  if (
    movimentoReduzido ||
    !cartoes.length ||
    !("IntersectionObserver" in window) ||
    !Element.prototype.animate
  ) {
    return;
  }

  const animados = new WeakSet();
  const animar = elemento => {
    if (animados.has(elemento)) return;
    animados.add(elemento);

    const irmaos = Array.from(elemento.parentElement.children)
      .filter(irmao => irmao.matches(seletorCartoes));
    const atraso = Math.max(0, irmaos.indexOf(elemento)) * 110;
    const animacao = elemento.animate(
      [
        { opacity: 0, transform: "translateY(10px) scale(0.985)" },
        { opacity: 1, transform: "translateY(0) scale(1)" },
      ],
      {
        duration: 700,
        delay: atraso,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both",
      }
    );

    animacao.onfinish = () => animacao.cancel();
  };

  const observador = new IntersectionObserver(
    entradas => {
      entradas.forEach(entrada => {
        if (!entrada.isIntersecting) return;

        animar(entrada.target);
        observador.unobserve(entrada.target);
      });
    },
    { threshold: 0.12 }
  );

  cartoes.forEach(cartao => {
    const posicao = cartao.getBoundingClientRect();
    if (posicao.width === 0 || posicao.height === 0) return;

    const visivel = posicao.top < window.innerHeight * 0.9 && posicao.bottom > 0;
    if (visivel) {
      animar(cartao);
    } else {
      observador.observe(cartao);
    }
  });
}

window.addEventListener("DOMContentLoaded", animarCartoesDashboard);