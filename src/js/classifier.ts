/**
 * Lógica de classificação e detecção de objetos.
 * Normaliza os retornos dos modelos (MobileNet e COCO-SSD) em um formato
 * comum, aplica o limiar de confiança e renderiza os resultados na UI,
 * incluindo bounding boxes para o COCO-SSD.
 */

import { traduzir } from './i18n.ts';
import { getModelo, getModeloName } from './models.ts';
import { els, showToast, renderHistoricoUI } from './ui.ts';
import { salvarHistoricoEntry } from './history.ts';
import type { MobileNet } from '@tensorflow-models/mobilenet';
import type { ObjectDetection } from '@tensorflow-models/coco-ssd';

/** Resultado normalizado de classificação. */
export interface Classificacao {
  className: string;
  probability: number;
  bbox?: number[];
}

/**
 * Aguarda o carregamento completo de um elemento .
 *
 * @param imgEl - Elemento de imagem.
 * @returns Promise que resolve quando a imagem estiver carregada.
 */
export function waitForImageLoad(imgEl: HTMLImageElement): Promise<void> {
  return new Promise((resolve, reject) => {
    if (imgEl.complete && imgEl.naturalHeight !== 0) {
      return resolve();
    }
    imgEl.onload = () => resolve();
    imgEl.onerror = () => reject(new Error('Erro ao carregar imagem'));
  });
}

/**
 * Compacta uma imagem antes da classificação, reduzindo tamanho e peso
 * sem prejudicar a precisão do modelo.
 *
 * @param file - Arquivo de imagem original.
 * @returns Blob compactado (ou o arquivo original se já for pequeno).
 */
export function comprimirImagem(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    if (file.size < 1.5 * 1024 * 1024) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      const MAX = 1200;
      if (w > MAX || h > MAX) {
        const ratio = Math.min(MAX / w, MAX / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          resolve(blob || file);
        },
        'image/jpeg',
        0.85,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

/**
 * Classifica um elemento DOM (imagem ou vídeo) usando o modelo ativo.
 *
 * @param el - Elemento de imagem ou vídeo.
 * @returns Array de classificações normalizadas.
 */
export async function classificarElemento(
  el: HTMLImageElement | HTMLVideoElement,
): Promise<Classificacao[]> {
  const modelo = getModelo();
  if (!modelo) {
    showToast('Modelo não carregado', 'error');
    return [];
  }

  try {
    if (getModeloName() === 'coco-ssd' && modelo && 'detect' in modelo) {
      const predictions = await (modelo as ObjectDetection).detect(el);
      return predictions.map((p) => ({
        className: p.class,
        probability: p.score,
        bbox: p.bbox,
      }));
    }

    if (modelo && 'classify' in modelo) {
      const predictions = await (modelo as MobileNet).classify(el);
      return predictions.map((p) => ({
        className: p.className,
        probability: p.probability,
      }));
    }

    return [];
  } catch (err) {
    showToast(`Erro na classificação: ${(err as Error).message}`, 'error');
    return [];
  }
}

/**
 * Renderiza os resultados de classificação como barras de confiança.
 *
 * @param results - Resultados de classificação.
 */
export function desenharResultados(results: Classificacao[]): void {
  const resultado = els.resultado as HTMLElement;
  const acoesResultado = els.acoesResultado as HTMLElement;
  const confThreshold = els.confThreshold as HTMLInputElement;
  resultado.innerHTML = '';

  const threshold = parseInt(confThreshold?.value || '0', 10) / 100;
  const filtrados = results.filter(
    (r) => (r.probability ?? 0) >= threshold,
  );

  if (!filtrados.length) {
    resultado.innerHTML =
      '<div class="resultado-empty">// nenhum resultado acima do limite de confiança</div>';
    acoesResultado.classList.add('hidden');
    return;
  }

  filtrados.forEach((r, i) => {
    const item = document.createElement('div');
    item.className = 'resultado-item';
    item.style.animation = 'fadeSlideIn 0.3s ease forwards';
    item.style.opacity = '0';

    const label = document.createElement('div');
    label.className = 'resultado-label';
    const nomeClasse = r.className || '';
    label.textContent = `${i + 1}. ${traduzir(nomeClasse)}`;

    const pct = r.probability * 100;
    const badge = document.createElement('span');
    badge.className = `confidence-badge ${
      pct > 75 ? 'confidence-high' : pct > 40 ? 'confidence-medium' : 'confidence-low'
    }`;
    badge.textContent = `${Math.round(pct)}%`;
    label.appendChild(badge);

    const barraWrap = document.createElement('div');
    barraWrap.className = 'resultado-barra';
    const barra = document.createElement('div');
    barra.className = 'resultado-progresso';
    barra.style.width = '0%';
    setTimeout(() => {
      barra.style.width = `${Math.min(100, pct)}%`;
    }, 50 + i * 120);

    const pctText = document.createElement('div');
    pctText.className = 'resultado-porcentagem';
    pctText.textContent = `${Math.round(pct)}%`;

    barraWrap.appendChild(barra);
    item.appendChild(label);
    item.appendChild(barraWrap);
    item.appendChild(pctText);
    resultado.appendChild(item);
  });

  acoesResultado.classList.remove('hidden');
}

/**
 * Desenha bounding boxes no canvas sobre a imagem (apenas COCO-SSD).
 *
 * @param results - Resultados de classificação com bbox.
 */
export function desenharBoundingBoxes(results: Classificacao[]): void {
  const canvas = els.bboxCanvas as HTMLCanvasElement;
  const img = els.imagemPreview as HTMLImageElement;
  if (!img || !img.naturalWidth) {return;}

  const rect = img.getBoundingClientRect();
  const wrapperRect = (els.previewWrapper as HTMLElement).getBoundingClientRect();
  canvas.classList.remove('hidden');
  canvas.width = rect.width;
  canvas.height = rect.height;
  canvas.style.left = `${rect.left - wrapperRect.left}px`;
  canvas.style.top = `${rect.top - wrapperRect.top}px`;

  const scaleX = rect.width / img.naturalWidth;
  const scaleY = rect.height / img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {return;}
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const confThreshold = els.confThreshold as HTMLInputElement;
  const threshold = parseInt(confThreshold?.value || '0', 10) / 100;

  results.forEach((r) => {
    if (r.probability < threshold || !r.bbox) {return;}
    const [x, y, w, h] = r.bbox;
    const sx = x * scaleX;
    const sy = y * scaleY;
    const sw = w * scaleX;
    const sh = h * scaleY;

    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 3;
    ctx.strokeRect(sx, sy, sw, sh);
    ctx.fillStyle = 'rgba(52, 211, 153, 0.15)';
    ctx.fillRect(sx, sy, sw, sh);

    const label = traduzir(r.className);
    const pct = Math.round(r.probability * 100);
    ctx.font = 'bold 13px DM Sans, sans-serif';
    const metrics = ctx.measureText(`${label} ${pct}%`);
    const padding = 4;
    const textH = 18;
    ctx.fillStyle = 'rgba(52, 211, 153, 0.85)';
    ctx.fillRect(
      sx,
      sy - textH - padding * 2,
      metrics.width + padding * 2,
      textH + padding * 2,
    );
    ctx.fillStyle = '#07080f';
    ctx.fillText(`${label} ${pct}%`, sx + padding, sy - padding);
  });
}

/**
 * Processa uma imagem a partir de uma URL: exibe preview, classifica,
 * desenha resultados/bounding boxes e salva no histórico.
 *
 * @param url - URL da imagem (Object URL ou data URL).
 * @param nome - Nome da imagem/origem.
 */
export async function processarImagemUrl(url: string, nome: string): Promise<void> {
  const imagemPreview = els.imagemPreview as HTMLImageElement;
  const videoPreview = els.videoPreview as HTMLVideoElement;
  const bboxCanvas = els.bboxCanvas as HTMLCanvasElement;

  imagemPreview.classList.remove('hidden');
  videoPreview.classList.add('hidden');
  bboxCanvas.classList.add('hidden');
  imagemPreview.src = url;

  await waitForImageLoad(imagemPreview);

  // Placeholder de carregamento (skeleton) enquanto classifica.
  const resultado = els.resultado as HTMLElement;
  resultado.innerHTML =
    '<div class="skeleton-line skeleton"></div><div class="skeleton-line skeleton" style="width:60%"></div>';

  const results = await classificarElemento(imagemPreview);
  desenharResultados(results);
  if (getModeloName() === 'coco-ssd') {
    desenharBoundingBoxes(results);
  }
  salvarHistoricoEntry({ nome, results, date: new Date().toISOString() });
  renderHistoricoUI();
}


