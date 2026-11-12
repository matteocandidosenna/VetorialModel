# Modelo Vetorial Generalizado (GVSM) - Apresentação Acadêmica

Aplicação web completa para apresentação acadêmica e simulação computacional do **Modelo Vetorial Generalizado (Generalized Vector Space Model - GVSM)**, proposto por Wong, Ziarko e Wong (1985).

Esta versão adota uma interface de **Tema Claro (Light Theme)** com estética institucional, tipografia sóbria, alto contraste para projeção em sala de aula e linguagem formal e direta.

---

## Como Executar

A aplicação é autossuficiente e executável diretamente em qualquer navegador moderno:

1. Acesse o diretório:
   ```bash
   cd C:\algoritmos\gvsm-apresentacao
   ```
2. Abra o arquivo `index.html` em seu navegador web (Google Chrome, Firefox, Microsoft Edge, etc.):
   - Clique duas vezes em `index.html`, ou
   - Inicie um servidor local HTTP:
     ```bash
     python -m http.server 8000
     ```

---

## Estrutura da Apresentação (30 Slides)

### Parte 1: Introdução e Motivação (Slides 1 a 6)
- **Slide 1:** Título institucional e objetivos da aula.
- **Slide 2:** O Modelo Vetorial Clássico (VSM): metáfora espacial e representação vetorial.
- **Slide 3:** A Hipótese da Ortogonalidade: visualizador geométrico com ângulo ortogonal de 90°.
- **Slide 4:** Limitação estrutural: o impacto da sinonímia e variação de vocabulário.
- **Slide 5:** Caso de estudo analítico no domínio de engenharia: *"Robótica"* vs. *"Automação"*.
- **Slide 6:** Origem histórica: publicações seminais (Wong, Ziarko & Wong, ACM SIGIR 1985; e com Raghavan, ACM TODS 1985; Baeza-Yates & Ribeiro-Neto, Cap. 2).

### Parte 2: Mintermos e Topologia (Slides 7 a 15)
- **Slide 7:** Definição formal e estrutura booleana dos mintermos.
- **Slide 8:** O espaço de mintermos como base ortonormal canônica.
- **Slide 9:** Fluxo computacional do GVSM (infográfico em 4 etapas).
- **Slide 10:** Dimensionalidade: prova de tratabilidade através dos mintermos ativos ($p \le N$).
- **Slide 11:** Sequência metodológica (Passo 1): coleção documental de referência ($D_1, D_2, D_3$).
- **Slide 12:** Sequência metodológica (Passo 2): mapeamento dos mintermos ativos na coleção.
- **Slide 13:** Sequência metodológica (Passo 3): diagrama de conjuntos demonstrando a ponte semântica.
- **Slide 14:** Sequência metodológica (Passo 4): processamento da consulta e recuperação por similaridade angular.
- **Slide 15:** Transformação geométrica: compasso vetorial com slider interativo para variação do ângulo de co-ocorrência.

### Parte 3: Formalização Matricial (Slides 16 a 22)
- **Slide 16:** Estrutura matricial do modelo: organização dos dados e componentes $C$ e $T$.
- **Slide 17:** O vetor canônico unitário de mintermo $\vec{m}_r = (0, \dots, 1, \dots, 0)^T \in \mathbb{R}^p$ e distinção da assinatura booleana.
- **Slide 18:** A Matriz de Padrões $C$ ($T \times p$): projeção normalizada unitária dos termos nos mintermos.
- **Slide 19:** Formulação e normalização euclidiana $\hat{c}_{i,r} = c_{i,r} / \sqrt{\sum c_{i,s}^2}$ com vetor unitário $\|\vec{t}_i\| = 1$ (Baeza-Yates & Wong).
- **Slide 20:** A Matriz de Correlação de Termos ($T = \hat{C} \hat{C}^T$): diagonal unitária $T_{ii} = 1.00$ e cossenos exatos $T_{ij} = \cos(\theta_{ij})$.
- **Slide 21:** Análise numérica da Matriz $T$ com diagonal unitária $1.00$ e $T(\text{Prog}, \text{Auto}) = 0.00$ (co-ocorrência em 1ª ordem).
- **Slide 22:** Representação em grafo de afinidade derivado dos coeficientes de correlação.

### Parte 4: Recuperação e Avaliação (Slides 23 a 28)
- **Slide 23:** Representação vetorial da consulta e dos documentos no espaço generalizado.
- **Slide 24:** Operação de projeção matricial no espaço semântico.
- **Slide 25:** Métrica de similaridade por cosseno com nota explicativa conceitual.
- **Slide 26:** Quadro comparativo analítico: VSM Clássico vs. GVSM.
- **Slide 27:** Vantagens estruturais e limitações práticas (trade-offs).
- **Slide 28:** Análise de complexidade computacional e escalabilidade assintótica ($\mathcal{O}$).

### Parte 5: Evolução e Laboratório (Slides 29 a 30)
- **Slide 29:** Evolução histórica dos modelos semânticos: de Salton (1975) aos Embeddings Neurais atuais.
- **Slide 30:** Laboratório prático interativo: simulador computacional em tempo real com medidor angular (gauge), barras comparativas e inspeção completa das matrizes $C$ e $T$.

---

## Controles de Navegação

| Tecla / Ação | Função |
| :--- | :--- |
| `Seta Direita` / `Seta Abaixo` / `Espaço` | Próximo Slide |
| `Seta Esquerda` / `Seta Acima` / `Backspace` | Slide Anterior |
| `Home` / `End` | Primeiro / Último Slide |
| `O` (tecla O) | Abrir / Fechar Painel de Visão Geral |
| `ESC` | Fechar Modais |
| Botão `Tela Cheia` | Alternar Modo Apresentação em Tela Cheia |

---

## Padrões de Design e Tecnologias
- **Tema Claro Institucional:** Tipografia legível (*Plus Jakarta Sans* e *Fira Code*), paleta em azul acadêmico e cinzas neutros de alto contraste.
- **KaTeX (CDN):** Renderização matemática padrão TeX em texto escuro de alta nitidez.
- **SVG Dinâmico:** Compasso vetorial e medidor circular estilizados sob princípios de design minimalista.
- **Vanilla JavaScript:** Motor computacional completo sem dependências externas pesadas.
