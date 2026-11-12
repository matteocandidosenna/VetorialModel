/**
 * GVSM Presentation Controller
 * Navegação, KaTeX auto-render, Overview Modal e Gráficos Vetoriais
 * Padrão Acadêmico: Sóbrio e Estável
 */

document.addEventListener("DOMContentLoaded", () => {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const totalSlides = slides.length;
  let currentSlideIndex = 0;

  const progressFill = document.querySelector(".progress-fill");
  const slideCounterCurrent = document.querySelector(".slide-counter span.current");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const btnOverview = document.getElementById("btn-overview");
  const btnCloseOverview = document.getElementById("btn-close-overview");
  const overviewModal = document.getElementById("overview-modal");
  const overviewGrid = document.getElementById("overview-grid");
  const btnFullscreen = document.getElementById("btn-fullscreen");

  function showSlide(index) {
    if (index < 0) index = 0;
    if (index >= totalSlides) index = totalSlides - 1;

    slides.forEach((s, i) => {
      s.classList.toggle("active", i === index);
    });

    currentSlideIndex = index;

    if (progressFill) {
      const pct = totalSlides > 1 ? (index / (totalSlides - 1)) * 100 : 0;
      progressFill.style.width = `${pct}%`;
    }

    if (slideCounterCurrent) {
      slideCounterCurrent.textContent = String(index + 1).padStart(2, "0");
    }

    if (btnPrev) btnPrev.disabled = index === 0;
    if (btnNext) btnNext.disabled = index === totalSlides - 1;

    const activeSlide = slides[index];
    if (activeSlide && window.renderMathInElement) {
      try {
        renderMathInElement(activeSlide, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false }
          ],
          throwOnError: false
        });
      } catch (e) {
        console.warn("KaTeX render notice:", e);
      }
    }

    if (index + 1 === 3) {
      setupSlide3Compass();
    } else if (index + 1 === 15) {
      setupSlide15Compass();
    }
  }

  function nextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
      showSlide(currentSlideIndex + 1);
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      showSlide(currentSlideIndex - 1);
    }
  }

  function buildOverviewGrid() {
    if (!overviewGrid) return;
    overviewGrid.innerHTML = "";

    slides.forEach((slide, idx) => {
      const thumb = document.createElement("div");
      thumb.className = `overview-thumb ${idx === currentSlideIndex ? "current" : ""}`;
      
      const partTag = slide.querySelector(".part-tag");
      const partText = partTag ? partTag.textContent : `Slide ${idx + 1}`;

      const titleEl = slide.querySelector("h1, h2");
      const titleText = titleEl ? titleEl.textContent : `Slide ${idx + 1}`;

      thumb.innerHTML = `
        <div class="thumb-num">SLIDE ${String(idx + 1).padStart(2, "0")}</div>
        <div class="thumb-title">${titleText}</div>
        <div class="thumb-part">${partText}</div>
      `;

      thumb.addEventListener("click", () => {
        showSlide(idx);
        closeOverview();
      });

      overviewGrid.appendChild(thumb);
    });
  }

  function openOverview() {
    buildOverviewGrid();
    if (overviewModal) overviewModal.classList.add("active");
  }

  function closeOverview() {
    if (overviewModal) overviewModal.classList.remove("active");
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  function setupSlide3Compass() {
    const box = document.getElementById("vector-compass-slide-3");
    const btnVsm = document.getElementById("s3-btn-vsm");
    const btnGvsm = document.getElementById("s3-btn-gvsm");
    const desc = document.getElementById("s3-compass-desc");

    if (!box) return;

    if (window.renderVectorCompassSVG) {
      window.renderVectorCompassSVG(box, 90, "VSM Ortogonal");
    }

    if (btnVsm) {
      btnVsm.onclick = () => {
        if (window.renderVectorCompassSVG) window.renderVectorCompassSVG(box, 90, "VSM Ortogonal");
        if (desc) desc.innerHTML = "<strong>Modelo Clássico (VSM):</strong> Ângulo ortogonal de 90°. $\\cos(90°) = 0$. Os termos são tratados como variáveis estritamente independentes.";
        btnVsm.classList.add("primary");
        btnGvsm.classList.remove("primary");
        if (window.renderMathInElement) renderMathInElement(desc);
      };
    }

    if (btnGvsm) {
      btnGvsm.onclick = () => {
        if (window.renderVectorCompassSVG) window.renderVectorCompassSVG(box, 42, "GVSM Semântico");
        if (desc) desc.innerHTML = "<strong>Modelo Generalizado (GVSM):</strong> O ângulo é reduzido para ~42°. $\\cos(42°) \\approx 0.74$. Os termos aproximam-se angularmente pela co-ocorrência observada nos dados.";
        btnGvsm.classList.add("primary");
        btnVsm.classList.remove("primary");
        if (window.renderMathInElement) renderMathInElement(desc);
      };
    }
  }

  function setupSlide15Compass() {
    const box = document.getElementById("vector-compass-slide-15");
    const slider = document.getElementById("s15-angle-slider");
    const angleDisplay = document.getElementById("s15-angle-display");
    const cosDisplay = document.getElementById("s15-cos-display");

    if (!box) return;

    const updateFromSlider = (val) => {
      const angle = parseInt(val, 10);
      if (window.renderVectorCompassSVG) window.renderVectorCompassSVG(box, angle, `${angle}°`);
      if (angleDisplay) angleDisplay.textContent = `${angle}°`;
      if (cosDisplay) {
        const rad = (angle * Math.PI) / 180;
        cosDisplay.textContent = Math.cos(rad).toFixed(3);
      }
    };

    if (slider) {
      slider.oninput = (e) => updateFromSlider(e.target.value);
      updateFromSlider(slider.value || 38);
    }
  }

  if (btnPrev) btnPrev.addEventListener("click", prevSlide);
  if (btnNext) btnNext.addEventListener("click", nextSlide);
  if (btnOverview) btnOverview.addEventListener("click", openOverview);
  if (btnCloseOverview) btnCloseOverview.addEventListener("click", closeOverview);
  if (btnFullscreen) btnFullscreen.addEventListener("click", toggleFullscreen);

  document.addEventListener("keydown", (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) {
      return;
    }

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
      case "PageDown":
      case " ":
        e.preventDefault();
        nextSlide();
        break;
      case "ArrowLeft":
      case "ArrowUp":
      case "PageUp":
      case "Backspace":
        e.preventDefault();
        prevSlide();
        break;
      case "Home":
        e.preventDefault();
        showSlide(0);
        break;
      case "End":
        e.preventDefault();
        showSlide(totalSlides - 1);
        break;
      case "o":
      case "O":
        if (overviewModal && overviewModal.classList.contains("active")) {
          closeOverview();
        } else {
          openOverview();
        }
        break;
      case "Escape":
        closeOverview();
        break;
    }
  });

  showSlide(0);
});
