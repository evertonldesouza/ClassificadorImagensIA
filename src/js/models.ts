/**
 * Gerenciamento de modelos de IA (MobileNet e COCO-SSD).
 * Controla carregamento, cache em memória, progresso e seleção do modelo ativo.
 */

import * as mobilenet from '@tensorflow-models/mobilenet';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { els, atualizarProgresso, setModelStatus } from './ui.ts';

/** Instâncias em cache dos modelos (evita recarregamento). */
let mobilenetModel: mobilenet.MobileNet | null = null;
let cocoModel: cocoSsd.ObjectDetection | null = null;

/** Modelo atualmente ativo e seu nome. */
let modelo: mobilenet.MobileNet | cocoSsd.ObjectDetection | null = null;
let modeloName: 'mobilenet' | 'coco-ssd' = 'mobilenet';

/**
 * Carrega (ou recupera do cache de memória) o modelo solicitado.
 * Atualiza a UI de progresso e status durante o processo.
 *
 * @param name - Nome do modelo a carregar.
 * @returns Instância do modelo carregado.
 * @throws Se o carregamento falhar.
 */
export async function carregarModelo(
  name: 'mobilenet' | 'coco-ssd',
): Promise<mobilenet.MobileNet | cocoSsd.ObjectDetection> {
  modeloName = name;
  (els.modeloProgresso as HTMLElement).classList.remove('hidden');
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
  return modelo as mobilenet.MobileNet | cocoSsd.ObjectDetection;
}

/**
 * Finaliza o carregamento: atualiza status, habilita controles e esconde
 * a barra de progresso após um curto atraso.
 */
function finalizarCarregamento(): void {
  setModelStatus('ready', 'Modelo carregado com sucesso!');
  setTimeout(() => {
    (els.modeloProgresso as HTMLElement).classList.add('hidden');
  }, 600);
  habilitarControles(true);
}

/**
 * Habilita ou desabilita os botões de entrada (câmera/upload).
 *
 * @param habilitado - Se true, habilita os controles.
 */
export function habilitarControles(habilitado: boolean): void {
  const btnWebcam = els.btnWebcam as HTMLButtonElement | null;
  const btnUpload = els.btnUpload as HTMLButtonElement | null;
  if (btnWebcam) {btnWebcam.disabled = !habilitado;}
  if (btnUpload) {btnUpload.disabled = !habilitado;}
}

/**
 * Retorna o modelo ativo.
 */
export function getModelo(): mobilenet.MobileNet | cocoSsd.ObjectDetection | null {
  return modelo;
}

/**
 * Retorna o nome do modelo ativo.
 */
export function getModeloName(): 'mobilenet' | 'coco-ssd' {
  return modeloName;
}
