/**
 * Gerenciamento de modelos de IA (MobileNet e COCO-SSD).
 * Controla carregamento, cache em memória, progresso e seleção do modelo ativo.
 */

import * as mobilenet from '@tensorflow-models/mobilenet';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { els, atualizarProgresso, setModelStatus } from './ui.js';

/** Instâncias em cache dos modelos (evita recarregamento). */
let mobilenetModel = null;
let cocoModel = null;

/** Modelo atualmente ativo e seu nome. */
let modelo = null;
let modeloName = 'mobilenet';

/**
 * Carrega (ou recupera do cache de memória) o modelo solicitado.
 * Atualiza a UI de progresso e status durante o processo.
 *
 * @param {'mobilenet'|'coco-ssd'} name - Nome do modelo a carregar.
 * @returns {Promise<Object>} Instância do modelo carregado.
 * @throws {Error} Se o carregamento falhar.
 */
export async function carregarModelo(name) {
  modeloName = name;
  els.modeloProgresso.classList.remove('hidden');
  setModelStatus('loading', 'Carregando modelo de IA...');

  // Já está em memória: reutiliza.
  if (name === 'mobilenet' && mobilenetModel) {
    modelo = mobilenetModel;
    finalizarCarregamento();
    return modelo;
  }
  if (name === 'coco-ssd' && cocoModel) {
    modelo = cocoModel;
    finalizarCarregamento();
    return modelo;
  }

  atualizarProgresso(10, 'Iniciando...');

  if (name === 'mobilenet') {
    atualizarProgresso(30, 'Baixando pesos MobileNet...');
    mobilenetModel = await mobilenet.load();
    modelo = mobilenetModel;
  } else if (name === 'coco-ssd') {
    atualizarProgresso(30, 'Baixando COCO-SSD...');
    cocoModel = await cocoSsd.load();
    modelo = cocoModel;
  }

  atualizarProgresso(100, 'Modelo pronto!');
  finalizarCarregamento();
  return modelo;
}

/**
 * Finaliza o carregamento: atualiza status, habilita controles e esconde
 * a barra de progresso após um curto atraso.
 */
function finalizarCarregamento() {
  setModelStatus('ready', 'Modelo carregado com sucesso!');
  setTimeout(() => {
    els.modeloProgresso.classList.add('hidden');
  }, 600);
  habilitarControles(true);
}

/**
 * Habilita ou desabilita os botões de entrada (câmera/upload).
 *
 * @param {boolean} habilitado
 */
export function habilitarControles(habilitado) {
  if (els.btnWebcam) {els.btnWebcam.disabled = !habilitado;}
  if (els.btnUpload) {els.btnUpload.disabled = !habilitado;}
}

/**
 * Retorna o modelo ativo.
 * @returns {Object|null}
 */
export function getModelo() {
  return modelo;
}

/**
 * Retorna o nome do modelo ativo.
 * @returns {'mobilenet'|'coco-ssd'}
 */
export function getModeloName() {
  return modeloName;
}
