/**
 * Controle da câmera: inicialização, troca de dispositivo, parada, captura
 * de foto e classificação em tempo real dos frames do vídeo.
 */

import { els, showToast, renderHistoricoUI } from './ui.js';
import { getModeloName } from './models.js';
import { salvarHistoricoEntry } from './history.js';
import {
  classificarElemento,
  desenharResultados,
  desenharBoundingBoxes,
  waitForImageLoad,
} from './classifier.js';

let stream = null;
let currentCameraDeviceId = null;
let analisandoTempoReal = false;
let animationFrameId = null;

/**
 * Inicializa a câmera com o dispositivo padrão (ou o especificado).
 *
 * @param {string|null} deviceId
 */
export async function startWebcam(deviceId = null) {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((d) => d.kind === 'videoinput');
    currentCameraDeviceId = deviceId || (videoDevices.length
      ? videoDevices[0].deviceId
      : null);
    await abrirCamera(currentCameraDeviceId);
  } catch (err) {
    showToast(`Erro na câmera: ${err.message}`, 'error');
  }
}

/**
 * Abre o stream de vídeo e exibe no elemento <video>.
 *
 * @param {string|null} deviceId
 */
export async function abrirCamera(deviceId) {
  pararCamera();
  const constraints = {
    audio: false,
    video: deviceId
      ? { deviceId: { exact: deviceId } }
      : { facingMode: 'environment' },
  };

  stream = await navigator.mediaDevices.getUserMedia(constraints);
  els.videoPreview.srcObject = stream;
  els.videoPreview.classList.remove('hidden');
  els.imagemPreview.classList.add('hidden');
  els.bboxCanvas.classList.add('hidden');
  document.getElementById('camera-controls').classList.remove('hidden');
}

/**
 * Para o stream da câmera e limpa o preview.
 */
export function pararCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
  pararAnaliseTempoReal();
  els.videoPreview.srcObject = null;
  els.videoPreview.classList.add('hidden');
  document.getElementById('camera-controls').classList.add('hidden');
}

/**
 * Troca para a próxima câmera disponível.
 */
export async function trocarCamera() {
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
export async function capturarFoto() {
  if (!els.videoPreview || !stream) {
    showToast('Câmera não ativa', 'warning');
    return;
  }

  const video = els.videoPreview;
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  els.imagemPreview.src = dataUrl;
  els.imagemPreview.classList.remove('hidden');
  els.videoPreview.classList.add('hidden');
  els.bboxCanvas.classList.add('hidden');

  await waitForImageLoad(els.imagemPreview);
  const results = await classificarElemento(els.imagemPreview);
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
 * Classifica a cada intervalo para não travar a UI.
 */
export function iniciarAnaliseTempoReal() {
  if (analisandoTempoReal || !stream) {return;}
  analisandoTempoReal = true;
  loopAnaliseTempoReal();
}

/**
 * Para a classificação contínua da câmera.
 */
export function pararAnaliseTempoReal() {
  analisandoTempoReal = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

/**
 * Retorna se a análise em tempo real está ativa.
 * @returns {boolean}
 */
export function isAnalisandoTempoReal() {
  return analisandoTempoReal;
}

/**
 * Loop de classificação de frames (throttled via requestAnimationFrame).
 */
function loopAnaliseTempoReal() {
  if (!analisandoTempoReal || !stream) {return;}

  const video = els.videoPreview;
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
