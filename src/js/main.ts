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
} from './ui.ts';
import { carregarModelo, getModelo, getModeloName } from './models.ts';
import {
  processarImagemUrl,
  desenharResultados,
  desenharBoundingBoxes,
  comprimirImagem,
} from './classifier.ts';
import {
  initModoEducativo,
  isModoEducativo,
  renderizarAtivacoes,
  limparAtivacoes,
} from './educational.ts';
import {
  startWebcam,
  pararCamera,
  trocarCamera,
  capturarFoto,
  iniciarAnaliseTempoReal,
  pararAnaliseTempoReal,
  isAnalisandoTempoReal,
} from './camera.ts';
import {
  limparHistorico,
  exportarHistoricoBlob,
} from './history.ts';
import {
  registrarSW,
  aplicarAtualizacaoSW,
  ouvirAtualizacaoSW,
} from './sw.ts';
import { traduzir } from './i18n.ts';

let ultimoResultado: { className: string; probability: number; bbox?: number[] }[] = [];

/**
 * Seleciona o modelo nos cards e no select, e dispara o carregamento.
 *
 * @param name - Nome do modelo a selecionar.
 */
export function selectModelo(name: 'mobilenet' | 'coco-ssd'): void {
  document.querySelectorAll('.modelo-card').forEach((c) => c.classList.remove('active'));
  const card = document.querySelector(`.modelo-card[data-model="${name}"]`);
  if (card) {card.classList.add('active');}

  const sel = document.getElementById('modelo-select') as HTMLSelectElement | null;
  if (sel) {
    sel.value = name;
    sel.dispatchEvent(new Event('change'));
  }
}

/**
 * Alterna o modelo ativo e recarrega se necessário.
 */
async function handleModeloChange(): Promise<void> {
  const novo = (els.modeloSelect as HTMLSelectElement).value;
  if (novo === getModeloName()) {return;}
  showToast(`Trocando para ${novo} — aguarde`, 'warning', 2000);
  await carregarModelo(novo as 'mobilenet' | 'coco-ssd');
}

/**
 * Manipula a seleção de arquivos via input de upload (arrasta e solta ou clique).
 *
 * @param e - Evento de mudança do input de arquivo.
 */
async function handleFiles(e: Event): Promise<void> {
  const target = e.target as HTMLInputElement | null;
  const files = Array.from(target?.files || []);
  if (!files.length) {return;}
  const areaUpload = els.areaUpload as HTMLElement;
  areaUpload.classList.add('hidden');

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

    if (isModoEducativo() && getModeloName() === 'mobilenet') {
      const modelo = getModelo();
      if (modelo) {
        renderizarAtivacoes(
          els.imagemPreview as HTMLImageElement,
          modelo,
        );
      }
    }
  }

  if (target) {target.value = '';}
  if (files.length > 1) {showToast(`${files.length} imagens analisadas`, 'success');}
}

/**
 * Baixa a imagem em preview (resultado da classificação).
 */
function baixarResultado(): void {
  const imagemPreview = els.imagemPreview as HTMLImageElement;
  const src = imagemPreview.src;
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
async function compartilharResultado(): Promise<void> {
  if (!navigator.share) {
    showToast('Seu navegador não suporta compartilhamento', 'warning');
    return;
  }

  const topResult = ultimoResultado.length
    ? traduzir(
        ultimoResultado[0].className ?? 'minha imagem',
      )
    : 'minha imagem';

  try {
    const imagemPreview = els.imagemPreview as HTMLImageElement;
    const response = await fetch(imagemPreview.src);
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
    if ((err as Error).name !== 'AbortError') {
      showToast(`Compartilhamento falhou: ${(err as Error).message}`, 'error');
    }
  }
}

/**
 * Copia o texto do resultado principal para a área de transferência.
 */
function copiarResultado(): void {
  if (!ultimoResultado.length) {
    showToast('Nenhum resultado para copiar', 'warning');
    return;
  }
  const texto = ultimoResultado
    .map(
      (r, i) =>
        `${i + 1}. ${traduzir(r.className)} — ${Math.round((r.probability ?? 0) * 100)}%`,
    )
    .join('\n');
  copiarParaClipboard(texto).then((ok) => {
    showToast(ok ? 'Resultado copiado!' : 'Não foi possível copiar', ok ? 'success' : 'error');
  });
}

/**
 * Limpa a análise atual (preview, resultado, câmera).
 */
function limparAnaliseAtual(): void {
  const imagemPreview = els.imagemPreview as HTMLImageElement;
  const videoPreview = els.videoPreview as HTMLVideoElement;
  const bboxCanvas = els.bboxCanvas as HTMLCanvasElement;
  imagemPreview.classList.add('hidden');
  videoPreview.classList.add('hidden');
  bboxCanvas.classList.add('hidden');
  imagemPreview.src = '';
  pararCamera();
  limparAtivacoes();
  const resultado = els.resultado as HTMLElement;
  resultado.innerHTML = '<div class="resultado-empty">// aguardando análise</div>';
  const acoesResultado = els.acoesResultado as HTMLElement;
  acoesResultado.classList.add('hidden');
  ultimoResultado = [];
}

/**
 * Configura todos os ouvintes de evento da aplicação.
 */
function configurarOuvintes(): void {
  // Seleção de modelo (cards)
  document.querySelectorAll('.modelo-card').forEach((card) => {
    card.addEventListener('click', () => {
      const name = card.getAttribute('data-model');
      if (name === 'mobilenet' || name === 'coco-ssd') {
        selectModelo(name);
      }
    });
  });

  // Troca de modelo via <select>
  (els.modeloSelect as HTMLSelectElement).addEventListener('change', handleModeloChange);

  // Upload / drag & drop
  const uploadInput = els.uploadInput as HTMLInputElement;
  uploadInput.addEventListener('change', handleFiles);
  const btnUpload = els.btnUpload as HTMLButtonElement;
  btnUpload.addEventListener('click', () => {
    const areaUpload = els.areaUpload as HTMLElement;
    areaUpload.classList.remove('hidden');
  });

  const areaUpload = els.areaUpload as HTMLElement;
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
    if (!e.dataTransfer) {return;}
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/'),
    );
    if (files.length) {
      handleFiles({ target: { files } } as unknown as Event);
    }
  });

  // Câmera
  const btnWebcam = els.btnWebcam as HTMLButtonElement;
  btnWebcam.addEventListener('click', () => startWebcam());
  const btnCapturar = els.btnCapturar as HTMLButtonElement;
  btnCapturar.addEventListener('click', capturarFoto);
  const btnParar = els.btnParar as HTMLButtonElement;
  btnParar.addEventListener('click', pararCamera);
  const btnTrocarCamera = els.btnTrocarCamera as HTMLButtonElement;
  btnTrocarCamera.addEventListener('click', trocarCamera);

  // Ações do resultado
  const btnLimpar = els.btnLimpar as HTMLButtonElement;
  btnLimpar.addEventListener('click', limparAnaliseAtual);
  const btnDownload = els.btnDownload as HTMLButtonElement;
  btnDownload.addEventListener('click', baixarResultado);
  const btnCompartilhar = els.btnCompartilhar as HTMLButtonElement;
  btnCompartilhar.addEventListener('click', compartilharResultado);
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
  const confThreshold = els.confThreshold as HTMLInputElement;
  confThreshold.addEventListener('input', function () {
    const confThresholdValue = els.confThresholdValue as HTMLElement;
    confThresholdValue.textContent = `${this.value}%`;
    localStorage.setItem('ia_conf_threshold', this.value);
    if (ultimoResultado.length) {
      desenharResultados(ultimoResultado);
      if (getModeloName() === 'coco-ssd') {
        desenharBoundingBoxes(ultimoResultado);
      }
    }
  });
  const savedThreshold = localStorage.getItem('ia_conf_threshold');
  if (savedThreshold !== null && confThreshold) {
    confThreshold.value = savedThreshold;
    const confThresholdValue = els.confThresholdValue as HTMLElement;
    confThresholdValue.textContent = `${savedThreshold}%`;
  }

  // Histórico
  const btnLimparHistorico = els.btnLimparHistorico as HTMLButtonElement;
  btnLimparHistorico.addEventListener('click', () => {
    mostrarModalConfirmacao(() => {
      limparHistorico();
      renderHistoricoUI();
      showToast('Histórico limpo');
    });
  });
  const btnExportHistorico = els.btnExportHistorico as HTMLButtonElement;
  btnExportHistorico.addEventListener('click', () => {
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
  const themeToggle = els.themeToggle as HTMLButtonElement;
  themeToggle.addEventListener('click', toggleTheme);

  // SW atualização
  const btnSwUpdate = els.btnSwUpdate as HTMLButtonElement;
  btnSwUpdate.addEventListener('click', aplicarAtualizacaoSW);

  // Atalhos de teclado
  document.addEventListener('keydown', (e) => {
    // Ignora se o usuário está digitando em um input
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
    ) {
      return;
    }
    if (e.key === 'Escape') {
      limparAnaliseAtual();
      pararAnaliseTempoReal();
    } else if (e.key === 'c' || e.key === 'C') {
      // Ativa/desativa câmera
      const btnWebcam = els.btnWebcam as HTMLButtonElement;
      if (!btnWebcam.disabled) {
        const videoPreview = els.videoPreview as HTMLVideoElement;
        if (videoPreview.srcObject) {
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

/**
/**
 * Inicialização da aplicação.
 */
async function init(): Promise<void> {
  // Tema inicial
  checkInitialTheme();

  // Modo educativo
  initModoEducativo();

  // Ouvintes
  configurarOuvintes();

  // Carrega modelo padrão
  try {
    await carregarModelo('mobilenet');
  } catch (err) {
    showToast(`Erro ao carregar modelo: ${(err as Error).message}`, 'error');
    const statusModelo = els.statusModelo as HTMLElement;
    const statusModeloText = els.statusModeloText as HTMLElement;
    statusModelo.className = 'status-error';
    statusModeloText.textContent = 'Erro ao carregar modelo';
  }

  // Histórico inicial
  renderHistoricoUI();

  // Service Worker + atualizações
  registrarSW();
  ouvirAtualizacaoSW();
}

// Expõe selectModelo no escopo global para compatibilidade
// com qualquer referência inline remanescente no HTML.
(window as unknown as { selectModelo?: typeof selectModelo }).selectModelo =
  selectModelo;

init();
