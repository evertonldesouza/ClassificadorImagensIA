/**
 * Controle da câmera: inicialização, troca de dispositivo, parada, captura
 * de foto e classificação em tempo real dos frames do vídeo.
 */

import { els, showToast } from './ui.ts';
import { getModeloName } from './models.ts';
import {
  classificarElemento,
  desenharResultados,
  desenharBoundingBoxes,
  waitForImageLoad,
} from './classifier.ts';
import { salvarHistoricoEntry } from './history.ts';
import { renderHistoricoUI } from './ui.ts';

let stream: MediaStream | null = null;
let currentCameraDeviceId: string | null = null;
let analisandoTempoReal = false;
let animationFrameId: number | null = null;

/**
 * Inicializa a câmera com o dispositivo padrão (ou o especificado).
 *
 * @param deviceId - ID do dispositivo de câmera.
 */
export async function startWebcam(deviceId: string | null = null): Promise<void> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((d) => d.kind === 'videoinput');
    currentCameraDeviceId =
      deviceId ||
      (videoDevices.length ? videoDevices[0].deviceId : null);
    await abrirCamera(currentCameraDeviceId);
  } catch (err) {
    showToast(`Erro na câmera: ${(err as Error).message}`, 'error');
  }
}

/**
 * Abre o stream de vídeo e exibe no elemento .
 *
 * @param deviceId - ID do dispositivo de câmera.
 */
export async function abrirCamera(deviceId: string | null): Promise<void> {
  pararCamera();
  const constraints = {
    audio: false,
    video: deviceId
      ? { deviceId: { exact: deviceId } }
      : { facingMode: 'environment' },
  };

  stream = await navigator.mediaDevices.getUserMedia(constraints as MediaStreamConstraints);
  const videoPreview = els.videoPreview as HTMLVideoElement;
  videoPreview.srcObject = stream;
  videoPreview.classList.remove('hidden');
  const imagemPreview = els.imagemPreview as HTMLImageElement;
  imagemPreview.classList.add('hidden');
  const bboxCanvas = els.bboxCanvas as HTMLCanvasElement;
  bboxCanvas.classList.add('hidden');
  const cameraControls = document.getElementById('camera-controls');
  if (cameraControls) {cameraControls.classList.remove('hidden');}
}

/**
 * Para o stream da câmera e limpa o preview.
 */
export function pararCamera(): void {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
  pararAnaliseTempoReal();
  const videoPreview = els.videoPreview as HTMLVideoElement;
  videoPreview.srcObject = null;
  videoPreview.classList.add('hidden');
  const cameraControls = document.getElementById('camera-controls');
  if (cameraControls) {cameraControls.classList.add('hidden');}
}

/**
 * Troca para a próxima câmera disponível.
 */
export async function trocarCamera(): Promise<void> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((d) => d.kind === 'videoinput');
    if (videoDevices.length < 2) {
      showToast('Nenhuma outra câmera disponível', 'warning');
      return;
    }
    let idx = videoDevices.findIndex((d) => d.deviceId === currentCameraDeviceId);
    idx = (idx + 1) % videoDevices.length;
    currentCameraDeviceId = videoDevices[idx].deviceId;
    await abrirCamera(currentCameraDeviceId);
  } catch {
    showToast('Erro ao trocar câmera', 'error');
  }
}

/**
 * Captura uma foto do frame atual da câmera e classifica.
 */
export async function capturarFoto(): Promise<void> {
  const videoPreview = els.videoPreview as HTMLVideoElement;
  if (!videoPreview || !stream) {
    showToast('Câmera não ativa', 'warning');
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = videoPreview.videoWidth;
  canvas.height = videoPreview.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    showToast('Erro ao criar canvas de captura', 'error');
    return;
  }
  ctx.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  const imagemPreview = els.imagemPreview as HTMLImageElement;
  imagemPreview.src = dataUrl;
  imagemPreview.classList.remove('hidden');
  videoPreview.classList.add('hidden');
  const bboxCanvas = els.bboxCanvas as HTMLCanvasElement;
  bboxCanvas.classList.add('hidden');

  await waitForImageLoad(imagemPreview);
  const results = await classificarElemento(imagemPreview);
  desenharResultados(results);
  if (getModeloName() === 'coco-ssd') {
    desenharBoundingBoxes(results);
  }

  salvarHistoricoEntry({
    nome: 'captura-camera',
    results,
    date: new Date().toISOString(),
  });
  renderHistoricoUI();
}

/**
 * Inicia a classificação contínua dos frames da câmera (tempo real).
 */
export function iniciarAnaliseTempoReal(): void {
  if (analisandoTempoReal || !stream) {return;}
  analisandoTempoReal = true;
  loopAnaliseTempoReal();
}

/**
 * Para a classificação contínua da câmera.
 */
export function pararAnaliseTempoReal(): void {
  analisandoTempoReal = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

/**
 * Retorna se a análise em tempo real está ativa.
 */
export function isAnalisandoTempoReal(): boolean {
  return analisandoTempoReal;
}

/**
 * Loop de classificação de frames (throttled via requestAnimationFrame).
 */
function loopAnaliseTempoReal(): void {
  if (!analisandoTempoReal || !stream) {return;}

  const video = els.videoPreview as HTMLVideoElement;
  if (video.readyState >= 2) {
    classificarElemento(video)
      .then((results) => {
        desenharResultados(results);
        if (getModeloName() === 'coco-ssd') {
          desenharBoundingBoxes(results);
        }
      })
      .catch(() => {
        // Ignora erros intermitentes de frame no tempo real.
      });
  }

  animationFrameId = requestAnimationFrame(loopAnaliseTempoReal);
}
