/**
 * Registro e gerenciamento do Service Worker (PWA).
 * Habilita uso offline, cache de modelos/CDN e notifica sobre atualizações.
 */

import { els } from './ui.js';

/**
 * Registra o Service Worker na raiz do domínio.
 */
export function registrarSW() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker
    .register('./service-worker.js', { scope: './' })
    .then((registro) => {
      // eslint-disable-next-line no-console
      console.log('[SW] Registrado com sucesso:', registro.scope);

      // Se há um SW waiting (nova versão), exibe banner de atualização.
      if (registro.waiting) {
        exibirBannerAtualizacao();
      }

      registro.addEventListener('updatefound', () => {
        const novoSW = registro.installing;
        if (!novoSW) {return;}
        novoSW.addEventListener('statechange', () => {
          if (novoSW.state === 'installed' && navigator.serviceWorker.controller) {
            // Nova versão instalada e há um controller ativo → atualização disponível.
            exibirBannerAtualizacao();
          }
        });
      });
    })
    .catch((err) => {
       
      console.warn('[SW] Falha ao registrar Service Worker:', err);
    });
}

/**
 * Exibe o banner de nova versão disponível.
 */
function exibirBannerAtualizacao() {
  if (!els.swBanner || !els.btnSwUpdate) {return;}
  els.swBanner.classList.remove('hidden');
  els.btnSwUpdate.onclick = aplicarAtualizacaoSW;
}

/**
 * Aplica a atualização do Service Worker (skip waiting + recarrega).
 */
export function aplicarAtualizacaoSW() {
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
  navigator.serviceWorker.ready.then((reg) => {
    reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
  });
  window.location.reload();
}

/**
 * Escuta mensagens do SW (ex.: SW_UPDATED) e eventos de controllerchange.
 */
export function ouvirAtualizacaoSW() {
  if (!navigator.serviceWorker) {return;}

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SW_UPDATED') {
      exibirBannerAtualizacao();
    }
  });

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) {return;}
    refreshing = true;
    window.location.reload();
  });
}
