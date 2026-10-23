/**
 * Ponto de entrada da aplicação.
 * Conecta módulos (UI, modelo, classificador, câmera, histórico, SW),
 * configura ouvintes de evento, atalhos de teclado e inicia o carregamento
 * do modelo padrão.
 */

import {
  els,
  checkInitialTheme,
  toggleTheme,
  mostrarModalConfirmacao,
  showToast,
  copiarParaClipboard,
  renderHistoricoUI,
} from './ui.js';
import { carregarModelo, getModeloName } from './models.js';
import {
  processarImagemUrl,
  desenharResultados,
  desenharBoundingBoxes,
  comprimirImagem,
} from './classifier.js';
import {
  startWebcam,
  pararCamera,
  trocarCamera,
  capturarFoto,
  iniciarAnaliseTempoReal,
  pararAnaliseTempoReal,
  isAnalisandoTempoReal,
} from './camera.js';
import {
  limparHistorico,
  exportarHistoricoBlob,
} from './history.js';
import { registrarSW, aplicarAtualizacaoSW, ouvirAtualizacaoSW } from './sw.js';
import { traduzir } from './i18n.js';

let ultimoResultado = [];

/**
 * Seleciona o modelo nos cards e no select, e dispara o carregamento.
 *
 * @param {'mobilenet'|'coco-ssd'} name
 */
export function selectModelo(name) {
  document
    .querySelectorAll('.modelo-card')
    .forEach((c) => c.classList.remove('active'));
  const card = document.querySelector(`.modelo-card[data-model="${name}"]`);
  if (card) {card.classList.add('active');}

  const sel = document.getElementById('modelo-select');
  if (sel) {
    sel.value = name;
    sel.dispatchEvent(new Event('change'));
  }
}

/**
 * Alterna o modelo ativo e recarrega se necessário.
 */
async function handleModeloChange() {
  const novo = els.modeloSelect.value;
  if (novo === getModeloName()) {return;}
  showToast(`Trocando para ${novo} — aguarde`, 'warning', 2000);
  await carregarModelo(novo);
}

/**
 * Manipula a seleção de arquivos via input de upload (arrasta e solta ou clique).
 *
 * @param {Event} e
 */
async function handleFiles(e) {
  const files = Array.from(e.target.files || []);
  if (!files.length) {return;}
  els.areaUpload.classList.add('hidden');

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      showToast(`Arquivo inválido: ${file.name}`, 'error');
      continue;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast(`${file.name} > 10 MB, ignorado`, 'warning');
      continue;
    }

    const compressed = await comprimirImagem(file);
    const imgUrl = URL.createObjectURL(compressed);
    await processarImagemUrl(imgUrl, file.name);
    URL.revokeObjectURL(imgUrl);
  }

  e.target.value = '';
  if (files.length > 1) {showToast(`${files.length} imagens analisadas`, 'success');}
}

/**
 * Baixa a imagem em preview (resultado da classificação).
 */
function baixarResultado() {
  const src = els.imagemPreview.src;
  if (!src || src.startsWith('data:') === false && !src.includes('blob')) {
    // ainda permite tentar baixar qualquer src válido
  }
  const link = document.createElement('a');
  link.href = src;
  link.download = 'classificacao-ia.jpg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Compartilha o resultado via Web Share API (arquivo ou fallback de URL).
 */
async function compartilharResultado() {
  if (!navigator.share) {
    showToast('Seu navegador não suporta compartilhamento', 'warning');
    return;
  }

  const topResult = ultimoResultado.length
    ? traduzir(ultimoResultado[0].className ?? ultimoResultado[0].class ?? 'minha imagem')
    : 'minha imagem';

  try {
    const response = await fetch(els.imagemPreview.src);
    const blob = await response.blob();
    const file = new File([blob], 'classificacao-ia.jpg', { type: blob.type });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: 'Resultado da Classificação',
        text: `Veja o que a IA encontrou: ${topResult}!`,
        files: [file],
      });
    } else {
      await navigator.share({
        title: 'Resultado da Classificação',
        text: `Veja o que a IA encontrou: ${topResult}!`,
        url: window.location.href,
      });
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      showToast(`Compartilhamento falhou: ${err.message}`, 'error');
    }
  }
}

/**
 * Copia o texto do resultado principal para a área de transferência.
 */
function copiarResultado() {
  if (!ultimoResultado.length) {
    showToast('Nenhum resultado para copiar', 'warning');
    return;
  }
  const texto = ultimoResultado
    .map((r, i) => `${i + 1}. ${traduzir(r.className ?? r.class ?? '')} — ${Math.round(((r.probability ?? r.score ?? 0) * 100))}%`)
    .join('\n');
  copiarParaClipboard(texto).then((ok) => {
    showToast(ok ? 'Resultado copiado!' : 'Não foi possível copiar', ok ? 'success' : 'error');
  });
}

/**
 * Limpa a análise atual (preview, resultado, câmera).
 */
function limparAnaliseAtual() {
  els.imagemPreview.classList.add('hidden');
  els.videoPreview.classList.add('hidden');
  els.bboxCanvas.classList.add('hidden');
  els.imagemPreview.src = '';
  pararCamera();
  els.resultado.innerHTML = '<div class="resultado-empty">// aguardando análise</div>';
  els.acoesResultado.classList.add('hidden');
  ultimoResultado = [];
}

/**
 * Configura todos os ouvintes de evento da aplicação.
 */
function configurarOuvintes() {
  // Seleção de modelo (cards)
  document.querySelectorAll('.modelo-card').forEach((card) => {
    card.addEventListener('click', () => {
      const name = card.getAttribute('data-model');
      if (name) {selectModelo(name);}
    });
  });

  // Troca de modelo via <select>
  els.modeloSelect.addEventListener('change', handleModeloChange);

  // Upload / drag & drop
  els.uploadInput.addEventListener('change', handleFiles);
  els.btnUpload.addEventListener('click', () => {
    els.areaUpload.classList.remove('hidden');
  });

  const areaUpload = els.areaUpload;
  areaUpload.addEventListener('dragover', (e) => {
    e.preventDefault();
    areaUpload.classList.add('dragover');
  });
  areaUpload.addEventListener('dragleave', () => {
    areaUpload.classList.remove('dragover');
  });
  areaUpload.addEventListener('drop', (e) => {
    e.preventDefault();
    areaUpload.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/'),
    );
    if (files.length) {
      handleFiles({ target: { files } });
    }
  });

  // Câmera
  els.btnWebcam.addEventListener('click', startWebcam);
  els.btnCapturar.addEventListener('click', capturarFoto);
  els.btnParar.addEventListener('click', pararCamera);
  els.btnTrocarCamera.addEventListener('click', trocarCamera);

  // Ações do resultado
  els.btnLimpar.addEventListener('click', limparAnaliseAtual);
  els.btnDownload.addEventListener('click', baixarResultado);
  els.btnCompartilhar.addEventListener('click', compartilharResultado);
  const btnCopiar = document.getElementById('btn-copiar-resultado');
  if (btnCopiar) {
    btnCopiar.addEventListener('click', copiarResultado);
  }

  // Toggle classificação em tempo real da câmera
  const btnTempoReal = document.getElementById('btn-tempo-real');
  if (btnTempoReal) {
    btnTempoReal.addEventListener('click', () => {
      const ativo = !isAnalisandoTempoReal();
      if (ativo) {
        iniciarAnaliseTempoReal();
      } else {
        pararAnaliseTempoReal();
      }
      btnTempoReal.classList.toggle('ativo', ativo);
      btnTempoReal.setAttribute('aria-pressed', String(ativo));
      showToast(
        ativo ? 'Tempo real ativado' : 'Tempo real desativado',
        'success',
        1500,
      );
    });
  }

  // Limite de confiança
  els.confThreshold.addEventListener('input', function () {
    els.confThresholdValue.textContent = `${this.value}%`;
    localStorage.setItem('ia_conf_threshold', this.value);
    if (ultimoResultado.length) {
      desenharResultados(ultimoResultado);
      if (getModeloName() === 'coco-ssd') {
        desenharBoundingBoxes(ultimoResultado);
      }
    }
  });
  const savedThreshold = localStorage.getItem('ia_conf_threshold');
  if (savedThreshold !== null && els.confThreshold) {
    els.confThreshold.value = savedThreshold;
    els.confThresholdValue.textContent = `${savedThreshold}%`;
  }

  // Histórico
  els.btnLimparHistorico.addEventListener('click', () => {
    mostrarModalConfirmacao(() => {
      limparHistorico();
      renderHistoricoUI();
      showToast('Histórico limpo');
    });
  });
  els.btnExportHistorico.addEventListener('click', () => {
    const blob = exportarHistoricoBlob();
    if (!blob) {
      showToast('Nenhum histórico para exportar', 'warning');
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'historico-classificador-ia.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Histórico exportado com sucesso!');
  });

  // Tema
  els.themeToggle.addEventListener('click', toggleTheme);

  // SW atualização
  els.btnSwUpdate.addEventListener('click', aplicarAtualizacaoSW);

  // Atalhos de teclado
  document.addEventListener('keydown', (e) => {
    // Ignora se o usuário está digitando em um input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    if (e.key === 'Escape') {
      limparAnaliseAtual();
      pararAnaliseTempoReal();
    } else if (e.key === 'c' || e.key === 'C') {
      // Ativa/desativa câmera (se não estiver analisando em tempo real)
      if (els.btnWebcam && !els.btnWebcam.disabled) {
        if (streamAtivo()) {
          pararCamera();
        } else {
          startWebcam();
        }
      }
    } else if (e.key === 'r' || e.key === 'R') {
      capturarFoto();
    } else if (e.key === '1') {
      selectModelo('mobilenet');
      carregarModelo('mobilenet');
    } else if (e.key === '2') {
      selectModelo('coco-ssd');
      carregarModelo('coco-ssd');
    }
  });
}

const streamAtivo = () => !!document.getElementById('video-preview').srcObject;

/**
 * Inicialização da aplicação.
 */
async function init() {
  // Tema inicial
  checkInitialTheme();

  // Ouvintes
  configurarOuvintes();

  // Carrega modelo padrão
  try {
    await carregarModelo('mobilenet');
  } catch (err) {
    showToast(`Erro ao carregar modelo: ${err.message}`, 'error');
    els.statusModelo.className = 'status-error';
    els.statusModeloText.textContent = 'Erro ao carregar modelo';
  }

  // Histórico inicial
  renderHistoricoUI();

  // Service Worker + atualizações
  registrarSW();
  ouvirAtualizacaoSW();
}

// Expõe selectModelo no escopo global para compatibilidade com qualquer
// referência inline remanescente no HTML (boa prática de transição).
window.selectModelo = selectModelo;

init();
