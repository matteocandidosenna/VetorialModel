/**
 * GVSM - Generalized Vector Space Model Engine
 * Implementação Didática e Visual para Apresentação Acadêmica
 * Padrão Institucional: Tema Claro, Alto Contraste e Notação Precisa
 */

// 1. Corpus de Demonstração Acadêmica (Domínio: Engenharia & Computação)
const CORPUS = [
  {
    id: "D1",
    title: "Robótica Industrial e Programação",
    text: "Aplicações de robótica industrial e programação de braços mecânicos com visão computacional.",
    category: "Robótica Aplicada"
  },
  {
    id: "D2",
    title: "Automação e Robótica Fabril",
    text: "Sistemas de automação industrial e robótica para manufatura avançada com sensores de precisão.",
    category: "Automação"
  },
  {
    id: "D3",
    title: "Algoritmos e Programação de Redes",
    text: "Programação de algoritmos para redes neurais e aprendizado de máquina em automação.",
    category: "Inteligência Artificial"
  },
  {
    id: "D4",
    title: "Sensores em Robótica Móvel",
    text: "Desenvolvimento de sensores para robótica móvel e telemetria em ambientes industriais.",
    category: "Instrumentação"
  },
  {
    id: "D5",
    title: "Inteligência Artificial e Visão Computacional",
    text: "Algoritmos de inteligência artificial e visão computacional integrados a sistemas de robótica.",
    category: "Inteligência Artificial"
  },
  {
    id: "D6",
    title: "Automação e Controle de Precisão",
    text: "Sistemas de controle e automação com sensores para controle de processos.",
    category: "Automação"
  }
];

// 2. Vocabulário Selecionado de Termos-Chave
const VOCABULARY = [
  "robótica",
  "programação",
  "automação",
  "sensores",
  "algoritmos",
  "inteligência",
  "controle"
];

// Tooltips didáticos objetivos para cada termo
const TERM_TOOLTIPS = {
  "robótica": "Termo t1: atua como eixo de co-ocorrência conectando programação e automação.",
  "programação": "Termo t2: co-ocorre com robótica e algoritmos nos documentos D1 e D3.",
  "automação": "Termo t3: associado a sensores e controle industrial nos documentos D2 e D6.",
  "sensores": "Termo t4: conecta aplicações de robótica móvel e automação.",
  "algoritmos": "Termo t5: liga programação e inteligência artificial.",
  "inteligência": "Termo t6: conecta visão computacional e algoritmos.",
  "controle": "Termo t7: frequente em sistemas de automação e instrumentação."
};

// 3. Motor GVSM
class GVSMEngine {
  constructor(corpus, vocab) {
    this.corpus = corpus;
    this.vocab = vocab;
    this.N = corpus.length;
    this.T = vocab.length;
    
    this.docTermMatrix = [];
    this.minterms = [];
    this.mintermLabels = [];
    this.matrixC = [];
    this.matrixT = [];
    
    this.buildModel();
  }

  tokenize(text) {
    return text
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 2);
  }

  norm(w) {
    return w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  buildModel() {
    const df = new Array(this.T).fill(0);
    const tfList = [];

    this.corpus.forEach(doc => {
      const tokens = this.tokenize(doc.text);
      const tf = new Array(this.T).fill(0);
      
      this.vocab.forEach((term, idx) => {
        const nTerm = this.norm(term);
        const count = tokens.filter(t => t.startsWith(nTerm.slice(0, -1)) || t === nTerm).length;
        tf[idx] = count;
        if (count > 0) df[idx]++;
      });
      tfList.push(tf);
    });

    // Pesos TF-IDF normalizados para VSM
    this.docTermMatrix = tfList.map(tf => {
      const weights = tf.map((count, i) => {
        if (count === 0) return 0;
        const idf = Math.log(1 + this.N / (df[i] || 1));
        return (1 + Math.log(count)) * idf;
      });
      const norm = Math.hypot(...weights) || 1;
      return weights.map(w => w / norm);
    });

    // Extração de Mintermos Ativos
    const patternMap = new Map();

    this.corpus.forEach((doc, docIdx) => {
      const binaryPattern = this.docTermMatrix[docIdx].map(w => (w > 0 ? 1 : 0));
      const key = binaryPattern.join("");
      
      if (!patternMap.has(key)) {
        patternMap.set(key, {
          pattern: binaryPattern,
          docs: [docIdx],
          label: `m_{${patternMap.size + 1}}`
        });
      } else {
        patternMap.get(key).docs.push(docIdx);
      }
    });

    this.minterms = Array.from(patternMap.values());
    this.mintermLabels = this.minterms.map(m => m.label);
    const p = this.minterms.length;

    // Matriz C (|V| x p)
    // Nota: Em Wong (1985), t_i = sum c_{i,r} m_r captura magnitude absoluta.
    // No simulador interativo, pós-normalizamos didaticamente as linhas para que T = C C^T reflita os coeficientes de cosseno [0, 1].
    this.matrixC = Array.from({ length: this.T }, () => new Array(p).fill(0));

    this.minterms.forEach((minterm, r) => {
      minterm.docs.forEach(docIdx => {
        for (let i = 0; i < this.T; i++) {
          this.matrixC[i][r] += this.docTermMatrix[docIdx][i];
        }
      });
    });

    // Normalização das linhas da Matriz C
    for (let i = 0; i < this.T; i++) {
      const rowNorm = Math.hypot(...this.matrixC[i]) || 1;
      for (let r = 0; r < p; r++) {
        this.matrixC[i][r] /= rowNorm;
      }
    }

    // Matriz de Correlação T = C * C^T (|V| x |V|)
    this.matrixT = Array.from({ length: this.T }, () => new Array(this.T).fill(0));
    for (let i = 0; i < this.T; i++) {
      for (let j = 0; j < this.T; j++) {
        let dot = 0;
        for (let r = 0; r < p; r++) {
          dot += this.matrixC[i][r] * this.matrixC[j][r];
        }
        this.matrixT[i][j] = dot;
      }
    }
  }

  vectorizeQuery(queryString) {
    const tokens = this.tokenize(queryString);
    const qVec = new Array(this.T).fill(0);
    this.vocab.forEach((term, idx) => {
      const nTerm = this.norm(term);
      const count = tokens.filter(t => t.startsWith(nTerm.slice(0, -1)) || t === nTerm).length;
      if (count > 0) qVec[idx] = 1;
    });
    const norm = Math.hypot(...qVec) || 1;
    return qVec.map(v => v / norm);
  }

  projectToGVSM(termWeights) {
    const p = this.minterms.length;
    const gvsmVec = new Array(p).fill(0);
    for (let r = 0; r < p; r++) {
      let sum = 0;
      for (let i = 0; i < this.T; i++) {
        sum += termWeights[i] * this.matrixC[i][r];
      }
      gvsmVec[r] = sum;
    }
    const norm = Math.hypot(...gvsmVec) || 1;
    return gvsmVec.map(v => v / norm);
  }

  search(queryString) {
    const qVsm = this.vectorizeQuery(queryString);
    const qGvsm = this.projectToGVSM(qVsm);

    const results = this.corpus.map((doc, docIdx) => {
      const dVsm = this.docTermMatrix[docIdx];
      const dGvsm = this.projectToGVSM(dVsm);

      let scoreVsm = 0;
      for (let i = 0; i < this.T; i++) {
        scoreVsm += qVsm[i] * dVsm[i];
      }

      let scoreGvsm = 0;
      for (let r = 0; r < this.minterms.length; r++) {
        scoreGvsm += qGvsm[r] * dGvsm[r];
      }

      const angleVsmDeg = Math.acos(Math.max(-1, Math.min(1, scoreVsm))) * (180 / Math.PI);
      const angleGvsmDeg = Math.acos(Math.max(-1, Math.min(1, scoreGvsm))) * (180 / Math.PI);

      return {
        doc,
        docIdx,
        scoreVsm: Math.max(0, scoreVsm),
        scoreGvsm: Math.max(0, scoreGvsm),
        angleVsmDeg: Math.round(angleVsmDeg * 10) / 10,
        angleGvsmDeg: Math.round(angleGvsmDeg * 10) / 10,
        delta: scoreGvsm - scoreVsm,
        hasAdvantage: scoreGvsm > scoreVsm + 0.05
      };
    });

    results.sort((a, b) => b.scoreGvsm - a.scoreGvsm);
    return { qVsm, qGvsm, results };
  }
}

let engine = null;
let currentSelectedResult = null;

function initGVSM() {
  engine = new GVSMEngine(CORPUS, VOCABULARY);
  setupEventListeners();
  renderMatrices();
  executeSearch("automação");
  initSlideVectorCompasses();
}

function setupEventListeners() {
  const btn = document.getElementById("btn-exec-search");
  const input = document.getElementById("search-query-input");

  if (btn && input) {
    btn.addEventListener("click", () => executeSearch(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") executeSearch(input.value);
    });
  }

  document.querySelectorAll(".quick-btn").forEach(b => {
    b.addEventListener("click", () => {
      const q = b.getAttribute("data-query");
      if (input) input.value = q;
      executeSearch(q);
    });
  });

  document.querySelectorAll(".sim-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");
      document.querySelectorAll(".sim-tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".sim-tab-pane").forEach(p => p.classList.remove("active"));
      
      btn.classList.add("active");
      const pane = document.getElementById(targetId);
      if (pane) pane.classList.add("active");
    });
  });
}

function executeSearch(query) {
  if (!engine) return;
  const searchData = engine.search(query);
  const container = document.getElementById("ranking-results-list");
  if (!container) return;

  container.innerHTML = "";

  searchData.results.forEach((res, index) => {
    const card = document.createElement("div");
    card.className = `ranking-row ${index === 0 ? "selected" : ""} ${res.hasAdvantage ? "gvsm-advantage" : ""}`;
    card.setAttribute("data-idx", index);
    
    const vsmPercent = Math.round(res.scoreVsm * 100);
    const gvsmPercent = Math.round(res.scoreGvsm * 100);
    const gainText = res.hasAdvantage ? `Ganho Semântico: +${(res.delta * 100).toFixed(0)}%` : "";

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
        <div>
          <span style="font-family: var(--font-mono); font-weight: 700; color: #0284c7;">${res.doc.id}</span>
          <strong style="margin-left: 0.5rem; color: #0f172a; font-size: 0.95rem;">${res.doc.title}</strong>
          <span style="font-size: 0.72rem; color: #475569; margin-left: 0.5rem; background: #f1f5f9; padding: 0.15rem 0.45rem; border-radius: 4px; border: 1px solid #e2e8f0;">${res.doc.category}</span>
        </div>
        <div style="font-size: 0.78rem; color: #059669; font-weight: 700;">${gainText}</div>
      </div>
      <div style="font-size: 0.85rem; color: #475569; margin-bottom: 0.6rem; line-height: 1.4;">${res.doc.text}</div>
      <div class="ranking-bars">
        <div class="score-bar-container has-tooltip" data-tooltip="Similaridade Clássica VSM: Depende da ocorrência exata dos termos na consulta.">
          <div class="bar-label">
            <span style="color: #64748b;">VSM Clássico (Ortogonal)</span>
            <span style="font-family: var(--font-mono); color: #334155;">${res.scoreVsm.toFixed(3)} (${res.angleVsmDeg}°)</span>
          </div>
          <div class="bar-track">
            <div class="bar-val vsm" style="width: ${vsmPercent}%;"></div>
          </div>
        </div>
        <div class="score-bar-container has-tooltip" data-tooltip="Similaridade GVSM: Considera correlações induzidas por co-ocorrência em mintermos.">
          <div class="bar-label">
            <span style="color: #0369a1; font-weight: 600;">GVSM Generalizado</span>
            <span style="font-family: var(--font-mono); color: #0369a1; font-weight: 700;">${res.scoreGvsm.toFixed(3)} (${res.angleGvsmDeg}°)</span>
          </div>
          <div class="bar-track">
            <div class="bar-val gvsm" style="width: ${gvsmPercent}%;"></div>
          </div>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      document.querySelectorAll(".ranking-row").forEach(r => r.classList.remove("selected"));
      card.classList.add("selected");
      currentSelectedResult = res;
      updateGauge(res);
      updateStepByStepExplanation(res, searchData.qVsm);
    });

    container.appendChild(card);
  });

  if (searchData.results.length > 0) {
    currentSelectedResult = searchData.results[0];
    updateGauge(searchData.results[0]);
    updateStepByStepExplanation(searchData.results[0], searchData.qVsm);
  }
}

// Medidor Circular (Gauge) no Padrão de Tema Claro Acadêmico
function updateGauge(res) {
  const svgWrapper = document.getElementById("gauge-svg-container");
  const scoreText = document.getElementById("gauge-val-text");
  const subText = document.getElementById("gauge-sub-info");
  const docTitle = document.getElementById("gauge-doc-title");

  if (!svgWrapper || !res) return;

  if (docTitle) docTitle.textContent = `${res.doc.id}: ${res.doc.title}`;
  if (scoreText) scoreText.textContent = res.scoreGvsm.toFixed(3);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const gvsmOffset = circumference - (res.scoreGvsm * circumference * 0.75);
  const vsmOffset = circumference - (res.scoreVsm * circumference * 0.75);

  svgWrapper.innerHTML = `
    <svg viewBox="0 0 180 180" width="180" height="180" style="transform: rotate(135deg);">
      <!-- Pista de Fundo Cinza Neutro -->
      <circle cx="90" cy="90" r="${radius}" fill="none" stroke="#e2e8f0" stroke-width="10"
        stroke-dasharray="${circumference}" stroke-dashoffset="${circumference * 0.25}" stroke-linecap="round"/>
      
      <!-- Arco VSM Clássico (Cinza Grafite) -->
      <circle cx="90" cy="90" r="${radius - 10}" fill="none" stroke="#94a3b8" stroke-width="5"
        stroke-dasharray="${circumference}" stroke-dashoffset="${vsmOffset}" stroke-linecap="round"/>

      <!-- Arco GVSM Generalizado (Azul Acadêmico Sólido) -->
      <circle cx="90" cy="90" r="${radius}" fill="none" stroke="#0284c7" stroke-width="10"
        stroke-dasharray="${circumference}" stroke-dashoffset="${gvsmOffset}" stroke-linecap="round"
        style="transition: stroke-dashoffset 0.5s ease;"/>
    </svg>
  `;

  if (subText) {
    const deltaDisplay = res.delta > 0 
      ? `<span style="color: #059669; font-weight: 700;">+${(res.delta * 100).toFixed(1)}% vs. VSM</span>`
      : `<span style="color: #64748b;">Equivalente ao VSM</span>`;
    subText.innerHTML = `
      <div>Score VSM Clássico: <strong>${res.scoreVsm.toFixed(3)}</strong> (${res.angleVsmDeg}°)</div>
      <div style="margin-top: 0.25rem;">Score GVSM: <strong>${res.scoreGvsm.toFixed(3)}</strong> (${res.angleGvsmDeg}°)</div>
      <div style="margin-top: 0.35rem; font-size: 0.78rem;">${deltaDisplay}</div>
    `;
  }
}

function updateStepByStepExplanation(res, qVec) {
  const container = document.getElementById("step-by-step-content");
  if (!container || !res || !engine) return;

  const matchedTerms = [];
  const correlatedTerms = [];

  engine.vocab.forEach((t, i) => {
    const qWeight = qVec[i];
    const dWeight = engine.docTermMatrix[res.docIdx][i];

    if (qWeight > 0 && dWeight > 0) {
      matchedTerms.push(t);
    } else if (qWeight > 0 && dWeight === 0) {
      engine.vocab.forEach((otherT, j) => {
        if (engine.docTermMatrix[res.docIdx][j] > 0 && engine.matrixT[i][j] > 0.15) {
          correlatedTerms.push({ queryTerm: t, docTerm: otherT, corr: engine.matrixT[i][j] });
        }
      });
    }
  });

  let matchHtml = matchedTerms.length > 0 
    ? matchedTerms.map(t => `<span class="badge-term term-emerald">${t}</span>`).join(" ")
    : "<span style='color: #64748b;'>Nenhum termo exato coincide diretamente entre a consulta e este documento.</span>";

  let corrHtml = correlatedTerms.length > 0
    ? correlatedTerms.map(c => `
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem; font-size: 0.85rem;">
          <span class="badge-term term-cyan">${c.queryTerm}</span>
          <span style="color: #64748b;">→ correlacionado a →</span>
          <span class="badge-term term-indigo">${c.docTerm}</span>
          <span style="font-family: var(--font-mono); color: #0284c7; font-weight:600; margin-left: auto;">T = ${c.corr.toFixed(3)}</span>
        </div>
      `).join("")
    : "<span style='color: #64748b;'>Sem correlações indiretas significativas ativadas para este item.</span>";

  container.innerHTML = `
    <div class="academic-card highlight" style="margin-bottom: 1rem;">
      <div class="card-title">Documento Analisado: ${res.doc.id} - ${res.doc.title}</div>
      <p class="card-desc" style="margin-bottom: 0.75rem; font-style: italic;">"${res.doc.text}"</p>
      
      <div style="margin-bottom: 0.85rem;">
        <strong style="font-size: 0.85rem; color: #0f172a;">1. Correspondência Exata de Termos (Espaço Clássico):</strong>
        <div style="margin-top: 0.35rem;">${matchHtml}</div>
      </div>

      <div>
        <strong style="font-size: 0.85rem; color: #0f172a;">2. Correlações Indiretas Ativadas (Espaço GVSM via Matriz T):</strong>
        <div style="margin-top: 0.45rem;">${corrHtml}</div>
      </div>
    </div>

    <div class="academic-note">
      <strong>Interpretação Analítica:</strong> No modelo clássico, a ausência de correspondência léxica direta resultaria em similaridade nula ($\cos = 0$). 
      No GVSM, a co-ocorrência em mintermos compartilhados projeta o documento em direção angular favorável, 
      reduzindo o ângulo de <strong>${res.angleVsmDeg}°</strong> para <strong>${res.angleGvsmDeg}°</strong> e viabilizando a recuperação por afinidade semântica.
    </div>
  `;
}

function renderMatrices() {
  if (!engine) return;

  // Matriz C
  const cTable = document.getElementById("matrix-c-table");
  if (cTable) {
    let html = `<thead><tr><th>Termo \\ Mintermo</th>`;
    engine.mintermLabels.forEach((lbl, idx) => {
      html += `<th class="has-tooltip" data-tooltip="Mintermo ${lbl}: Padrão binário ${engine.minterms[idx].pattern.join('')}">${lbl}</th>`;
    });
    html += `</tr></thead><tbody>`;

    engine.vocab.forEach((term, i) => {
      html += `<tr><td style="font-weight:700; color:#0369a1; text-align:left;" class="has-tooltip" data-tooltip="${TERM_TOOLTIPS[term] || ''}">${term}</td>`;
      engine.mintermLabels.forEach((_, r) => {
        const val = engine.matrixC[i][r];
        const cellClass = val === 0 ? "cell-zero" : (val > 0.4 ? "cell-high" : "cell-active");
        html += `<td class="${cellClass} has-tooltip" data-tooltip="Projeção de '${term}' no mintermo ${engine.mintermLabels[r]}: ${val.toFixed(3)}">${val.toFixed(2)}</td>`;
      });
      html += `</tr>`;
    });
    html += `</tbody>`;
    cTable.innerHTML = html;
  }

  // Matriz T (Correlação)
  const tTable = document.getElementById("matrix-t-table");
  if (tTable) {
    let html = `<thead><tr><th>Termo</th>`;
    engine.vocab.forEach(t => {
      html += `<th style="writing-mode: vertical-rl; transform: rotate(180deg); padding: 0.5rem 0.2rem;">${t}</th>`;
    });
    html += `</tr></thead><tbody>`;

    engine.vocab.forEach((termI, i) => {
      html += `<tr><td style="font-weight:700; color:#0369a1; text-align:left;">${termI}</td>`;
      engine.vocab.forEach((termJ, j) => {
        const val = engine.matrixT[i][j];
        let cellStyle = "";
        if (i === j) {
          cellStyle = "background: #f0f9ff; color: #0369a1; font-weight:700;";
        } else if (val > 0.5) {
          cellStyle = "background: #ecfdf5; color: #065f46; font-weight:700;";
        } else if (val > 0.1) {
          cellStyle = "background: #f8fafc; color: #1e3a8a;";
        } else {
          cellStyle = "color: #94a3b8;";
        }
        html += `<td style="${cellStyle}" class="has-tooltip" data-tooltip="Correlação semântica T(${termI}, ${termJ}) = ${val.toFixed(3)}">${val.toFixed(2)}</td>`;
      });
      html += `</tr>`;
    });
    html += `</tbody>`;
    tTable.innerHTML = html;
  }
}

// Inspetor de Ângulo Vetorial em Fundo Claro
function initSlideVectorCompasses() {
  const container = document.getElementById("vector-compass-slide-3");
  if (container) {
    renderVectorCompassSVG(container, 90, "VSM Clássico (Ortogonal)");
  }

  const container15 = document.getElementById("vector-compass-slide-15");
  if (container15) {
    renderVectorCompassSVG(container15, 38, "GVSM (Ângulo Fechado)");
  }
}

function renderVectorCompassSVG(container, angleDeg, labelText) {
  const rad = (angleDeg * Math.PI) / 180;
  const originX = 50;
  const originY = 190;
  const len = 140;

  const v1X = originX + len;
  const v1Y = originY;

  const v2X = originX + len * Math.cos(rad);
  const v2Y = originY - len * Math.sin(rad);

  const arcRadius = 45;
  const arcX = originX + arcRadius * Math.cos(rad);
  const arcY = originY - arcRadius * Math.sin(rad);

  const isOrthogonal = angleDeg === 90;
  const strokeColor = isOrthogonal ? "#dc2626" : "#059669";

  container.innerHTML = `
    <svg viewBox="0 0 240 220" width="240" height="220" style="overflow: visible;">
      <!-- Eixos de Coordenadas Claros -->
      <line x1="${originX}" y1="10" x2="${originX}" y2="${originY}" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="3,3"/>
      <line x1="${originX}" y1="${originY}" x2="220" y2="${originY}" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="3,3"/>

      <!-- Arco de Ângulo -->
      ${isOrthogonal 
        ? `<rect x="${originX}" y="${originY - 18}" width="18" height="18" fill="none" stroke="#dc2626" stroke-width="1.5"/>`
        : `<path d="M ${originX + arcRadius} ${originY} A ${arcRadius} ${arcRadius} 0 0 0 ${arcX} ${arcY}" fill="none" stroke="#059669" stroke-width="2"/>`
      }

      <!-- Vetor 1: Robótica (Azul Acadêmico) -->
      <line x1="${originX}" y1="${originY}" x2="${v1X}" y2="${v1Y}" stroke="#0284c7" stroke-width="3" marker-end="url(#arrow-blue)"/>
      <text x="${v1X - 25}" y="${v1Y + 20}" fill="#0f172a" font-size="11" font-family="var(--font-mono)" font-weight="700">t₁ (Robótica)</text>

      <!-- Vetor 2: Automação -->
      <line x1="${originX}" y1="${originY}" x2="${v2X}" y2="${v2Y}" stroke="${strokeColor}" stroke-width="3" marker-end="url(#arrow-term2)"/>
      <text x="${v2X - 10}" y="${v2Y - 12}" fill="#0f172a" font-size="11" font-family="var(--font-mono)" font-weight="700">t₂ (Automação)</text>

      <!-- Medida do Ângulo -->
      <text x="${originX + 22}" y="${originY - 24}" fill="${strokeColor}" font-size="12" font-family="var(--font-mono)" font-weight="700">${angleDeg}°</text>

      <defs>
        <marker id="arrow-blue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#0284c7"/>
        </marker>
        <marker id="arrow-term2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="${strokeColor}"/>
        </marker>
      </defs>
    </svg>
  `;
}

window.GVSMEngine = GVSMEngine;
window.initGVSM = initGVSM;
window.renderVectorCompassSVG = renderVectorCompassSVG;

document.addEventListener("DOMContentLoaded", () => {
  initGVSM();
});
