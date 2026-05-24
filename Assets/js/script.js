let mobilenetModel = null;
let cocoModel = null;
let modelo = null;
let modeloName = 'mobilenet';
let stream = null;
let currentCameraDeviceId = null;
let ultimoResultado = [];
let analisando = false;

const HIST_KEY = 'ia_classificador_historico_v1';

const TRADUCOES = {
  'coffee mug': 'xícara de café', 'computer keyboard': 'teclado', 'monitor': 'monitor',
  'laptop': 'notebook', 'mouse': 'mouse', 'cell phone': 'celular', 'remote control': 'controle remoto',
  'book': 'livro', 'clock': 'relógio', 'vase': 'vaso', 'lamp': 'abajur', 'chair': 'cadeira',
  'couch': 'sofá', 'bed': 'cama', 'dining table': 'mesa de jantar', 'toilet': 'vaso sanitário',
  'tv': 'televisão', 'microwave': 'micro-ondas', 'oven': 'forno', 'toaster': 'torradeira',
  'sink': 'pia', 'refrigerator': 'geladeira', 'bottle': 'garrafa', 'cup': 'copo',
  'glass': 'cálice', 'spoon': 'colher', 'fork': 'garfo', 'knife': 'faca', 'bowl': 'tigela',
  'banana': 'banana', 'apple': 'maçã', 'orange': 'laranja', 'sandwich': 'sanduíche',
  'pizza': 'pizza', 'donut': 'rosquinha', 'cake': 'bolo', 'cookie': 'biscoito',
  'ice cream': 'sorvete', 'hot dog': 'cachorro-quente', 'person': 'pessoa', 'dog': 'cachorro',
  'cat': 'gato', 'horse': 'cavalo', 'bird': 'pássaro', 'fish': 'peixe', 'car': 'carro',
  'bicycle': 'bicicleta', 'motorcycle': 'moto', 'airplane': 'avião', 'bus': 'ônibus',
  'train': 'trem', 'boat': 'barco', 'traffic light': 'semáforo', 'stop sign': 'placa de pare',
  'fire hydrant': 'hidrante', 'parking meter': 'parquímetro', 'bench': 'banco',
  'backpack': 'mochila', 'umbrella': 'guarda-chuva', 'handbag': 'bolsa', 'tie': 'gravata',
  'suitcase': 'mala', 'frisbee': 'disco', 'skis': 'esquis', 'snowboard': 'snowboard',
  'sports ball': 'bola esportiva', 'kite': 'pipa', 'baseball bat': 'taco de beisebol',
  'baseball glove': 'luva de beisebol', 'skateboard': 'skate', 'surfboard': 'prancha de surf',
  'tennis racket': 'raquete de tênis', 'wine glass': 'taça de vinho', 'beer bottle': 'garrafa de cerveja',
  'phone': 'telefone', 'pen': 'caneta', 'pencil': 'lápis', 'scissors': 'tesoura',
  'watch': 'relógio de pulso', 'wallet': 'carteira', 'key': 'chave', 'glasses': 'óculos',
  'hat': 'chapéu', 'shoe': 'sapato', 'flower': 'flor', 'tree': 'árvore', 'plant': 'planta',
  'camera': 'câmera', 'headphones': 'fones de ouvido', 'microphone': 'microfone',
  'musical instrument': 'instrumento musical', 'guitar': 'violão', 'piano': 'piano',
};

function traduzir(texto) {
  const cached = localStorage.getItem('ia_trad_' + texto);
  if (cached) return cached;
  const encontrado = TRADUCOES[texto.toLowerCase()];
  if (encontrado) {
    localStorage.setItem('ia_trad_' + texto, encontrado);
    return encontrado;
  }
  return texto;
}

const els = {
  btnWebcam: document.getElementById('btn-webcam'),
  btnUpload: document.getElementById('btn-upload'),
  uploadInput: document.getElementById('upload-imagem'),
  areaUpload: document.getElementById('area-upload'),
  imagemPreview: document.getElementById('imagem-preview'),
  videoPreview: document.getElementById('video-preview'),
  bboxCanvas: document.getElementById('bbox-canvas'),
  previewWrapper: document.getElementById('preview-wrapper'),
  resultado: document.getElementById('resultado'),
  acoesResultado: document.getElementById('acoes-resultado'),
  historico: document.getElementById('historico'),
  historicoLista: document.getElementById('historico-lista'),
  statusModelo: document.getElementById('status-modelo'),
  statusModeloText: document.getElementById('status-modelo-text'),
  modeloSelect: document.getElementById('modelo-select'),
  modeloProgresso: document.getElementById('modelo-progresso'),
  modeloProgressoBar: document.getElementById('modelo-progresso-bar'),
  modeloProgressoText: document.getElementById('modelo-progresso-text'),
  btnCapturar: document.getElementById('btn-capturar'),
  btnTrocarCamera: document.getElementById('btn-trocar-camera'),
  btnParar: document.getElementById('btn-parar'),
  btnCompartilhar: document.getElementById('btn-compartilhar'),
  btnDownload: document.getElementById('btn-download'),
  btnLimpar: document.getElementById('btn-limpar'),
  btnLimparHistorico: document.getElementById('btn-limpar-historico'),
  btnExportHistorico: document.getElementById('btn-export-historico'),
  themeToggle: document.getElementById('theme-toggle'),
  totalAnalises: document.getElementById('total-analises'),
  maisFrequente: document.getElementById('mais-frequente'),
  confThreshold: document.getElementById('conf-threshold'),
  confThresholdValue: document.getElementById('conf-threshold-value'),
  modalContainer: document.getElementById('modal-container'),
  swBanner: document.getElementById('sw-update-banner'),
  btnSwUpdate: document.getElementById('btn-sw-update'),
};

function showToast(message, type, duration = 3500) {
  const t = document.createElement('div');
  t.className = 'toast ' + (type === 'error' ? 'error' : type === 'warning' ? 'warning' : '');
  t.textContent = message;
  t.setAttribute('role', 'alert');
  document.body.appendChild(t);
  setTimeout(() => {
    t.classList.add('removing');
    setTimeout(() => t.remove(), 300);
  }, duration - 300);
}

function selectModelo(name) {
  document.querySelectorAll('.modelo-card').forEach(c => c.classList.remove('active'));
  const card = document.querySelector(`.modelo-card[data-model="${name}"]`);
  if (card) card.classList.add('active');
  const sel = document.getElementById('modelo-select');
  if (sel) { sel.value = name; sel.dispatchEvent(new Event('change')); }
}

function init() {
  els.btnWebcam.disabled = true;
  els.btnUpload.disabled = true;

  els.uploadInput.addEventListener('change', handleFiles);
  els.btnWebcam.addEventListener('click', startWebcam);
  els.btnUpload.addEventListener('click', () => { els.areaUpload.classList.remove('hidden'); });
  els.modeloSelect.addEventListener('change', handleModeloChange);
  els.btnCapturar?.addEventListener('click', capturarFoto);
  els.btnParar?.addEventListener('click', pararCamera);
  els.btnTrocarCamera?.addEventListener('click', trocarCamera);
  els.btnLimparHistorico?.addEventListener('click', () => mostrarModalConfirmacao());
  els.themeToggle?.addEventListener('click', toggleTheme);
  els.btnDownload?.addEventListener('click', baixarResultado);
  els.btnCompartilhar?.addEventListener('click', compartilharResultado);
  els.btnLimpar?.addEventListener('click', limparAnalise);
  els.btnExportHistorico?.addEventListener('click', exportarHistorico);
  els.btnSwUpdate?.addEventListener('click', aplicarAtualizacaoSW);

  els.confThreshold?.addEventListener('input', function () {
    els.confThresholdValue.textContent = this.value + '%';
    localStorage.setItem('ia_conf_threshold', this.value);
    if (ultimoResultado.length) desenharResultados(ultimoResultado);
  });
  const savedThreshold = localStorage.getItem('ia_conf_threshold');
  if (savedThreshold !== null && els.confThreshold) {
    els.confThreshold.value = savedThreshold;
    els.confThresholdValue.textContent = savedThreshold + '%';
  }

  const areaUpload = els.areaUpload;
  areaUpload.addEventListener('dragover', (e) => { e.preventDefault(); areaUpload.classList.add('dragover'); });
  areaUpload.addEventListener('dragleave', () => { areaUpload.classList.remove('dragover'); });
  areaUpload.addEventListener('drop', (e) => {
    e.preventDefault();
    areaUpload.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) handleFiles({ target: { files } });
  });

  checkInitialTheme();
  carregarModelo('mobilenet').catch(err => {
    console.error(err);
    showToast('Erro ao carregar modelo: ' + err.message, 'error');
    els.statusModelo.className = 'status-error';
    els.statusModeloText.textContent = 'Erro ao carregar modelo';
  });

  renderHistoricoUI();
  ouvirAtualizacaoSW();
}

async function carregarModelo(name) {
  modeloName = name;
  els.modeloProgresso.classList.remove('hidden');
  els.statusModelo.className = 'status-loading';
  els.statusModeloText.textContent = 'Carregando modelo de IA...';

  if (name === 'mobilenet' && mobilenetModel) {
    modelo = mobilenetModel;
    finalizarCarregamento();
    return;
  }
  if (name === 'coco-ssd' && cocoModel) {
    modelo = cocoModel;
    finalizarCarregamento();
    return;
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
}

function finalizarCarregamento() {
  els.statusModelo.className = 'status-ready';
  els.statusModeloText.textContent = 'Modelo carregado com sucesso!';
  setTimeout(() => els.modeloProgresso.classList.add('hidden'), 600);
  els.btnWebcam.disabled = false;
  els.btnUpload.disabled = false;
}

function atualizarProgresso(percent, text) {
  els.modeloProgressoBar.style.width = percent + '%';
  els.modeloProgressoText.textContent = text || '';
}

async function handleModeloChange(e) {
  const novo = e.target.value;
  if (novo === modeloName) return;
  showToast('Trocando para ' + novo + ' — aguarde', 'warning', 2000);
  await carregarModelo(novo);
}

async function handleFiles(e) {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  els.areaUpload.classList.add('hidden');
  for (const file of files) {
    if (!file.type.startsWith('image/')) { showToast('Arquivo inválido: ' + file.name, 'error'); continue; }
    if (file.size > 10 * 1024 * 1024) { showToast(file.name + ' > 10MB, ignorado', 'warning'); continue; }
    const compressed = await comprimirImagem(file);
    const imgUrl = URL.createObjectURL(compressed);
    await processarImagemUrl(imgUrl, file.name);
    URL.revokeObjectURL(imgUrl);
  }
  e.target.value = '';
  if (files.length > 1) showToast(files.length + ' imagens analisadas', 'success');
}

function comprimirImagem(file) {
  return new Promise((resolve) => {
    if (file.size < 1.5 * 1024 * 1024) { resolve(file); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let w = img.naturalWidth, h = img.naturalHeight;
      const MAX = 1200;
      if (w > MAX || h > MAX) {
        const ratio = Math.min(MAX / w, MAX / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        resolve(blob || file);
      }, 'image/jpeg', 0.85);
    };
    img.onerror = () => resolve(file);
    img.src = url;
  });
}

async function processarImagemUrl(url, nome) {
  els.imagemPreview.classList.remove('hidden');
  els.videoPreview.classList.add('hidden');
  els.bboxCanvas.classList.add('hidden');
  els.imagemPreview.src = url;
  await waitForImageLoad(els.imagemPreview);

  els.resultado.innerHTML = '<div class="skeleton-line skeleton"></div><div class="skeleton-line skeleton" style="width:60%"></div>';

  const results = await classificarElemento(els.imagemPreview);
  desenharResultados(results);
  if (modeloName === 'coco-ssd') desenharBoundingBoxes(results);
  salvarHistoricoEntry({ nome, results, date: new Date().toISOString() });
}

function waitForImageLoad(imgEl) {
  return new Promise((res, rej) => {
    if (imgEl.complete && imgEl.naturalHeight !== 0) return res();
    imgEl.onload = () => res();
    imgEl.onerror = () => rej(new Error('Erro ao carregar imagem'));
  });
}

async function startWebcam() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    currentCameraDeviceId = videoDevices.length ? videoDevices[0].deviceId : null;
    await abrirCamera(currentCameraDeviceId);
  } catch (err) {
    showToast('Erro câmera: ' + err.message, 'error');
  }
}

async function abrirCamera(deviceId) {
  pararCamera();
  const constraints = {
    audio: false,
    video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' }
  };
  stream = await navigator.mediaDevices.getUserMedia(constraints);
  els.videoPreview.srcObject = stream;
  els.videoPreview.classList.remove('hidden');
  els.imagemPreview.classList.add('hidden');
  els.bboxCanvas.classList.add('hidden');
  document.getElementById('camera-controls').classList.remove('hidden');
}

function pararCamera() {
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  els.videoPreview.srcObject = null;
  els.videoPreview.classList.add('hidden');
  document.getElementById('camera-controls').classList.add('hidden');
}

async function trocarCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    if (videoDevices.length < 2) { showToast('Nenhuma outra câmera disponível', 'warning'); return; }
    let idx = videoDevices.findIndex(d => d.deviceId === currentCameraDeviceId);
    idx = (idx + 1) % videoDevices.length;
    currentCameraDeviceId = videoDevices[idx].deviceId;
    await abrirCamera(currentCameraDeviceId);
  } catch (err) {
    showToast('Erro trocar câmera', 'error');
  }
}

async function capturarFoto() {
  if (!els.videoPreview || !stream) { showToast('Câmera não ativa', 'warning'); return; }
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
  if (modeloName === 'coco-ssd') desenharBoundingBoxes(results);
  salvarHistoricoEntry({ nome: 'captura-camera', results, date: new Date().toISOString() });
}

async function classificarElemento(el) {
  if (!modelo) { showToast('Modelo não carregado', 'error'); return []; }
  if (modeloName === 'coco-ssd' && modelo.detect) {
    const predictions = await modelo.detect(el);
    return predictions.map(p => ({ className: p.class, probability: p.score, bbox: p.bbox }));
  }
  const predictions = await modelo.classify(el);
  return predictions.map(p => ({ className: p.className, probability: p.probability }));
}

function desenharResultados(results) {
  ultimoResultado = results;
  els.resultado.innerHTML = '';
  const threshold = parseInt(els.confThreshold?.value || 0) / 100;
  const filtrados = results.filter(r => (r.probability || r.score || 0) >= threshold);
  if (!filtrados.length) {
    els.resultado.innerHTML = '<div class="resultado-empty">// nenhum resultado acima do limite de confiança</div>';
    return;
  }
  filtrados.forEach((r, i) => {
    const item = document.createElement('div');
    item.className = 'resultado-item';
    const label = document.createElement('div');
    label.className = 'resultado-label';
    const nomeClasse = r.className || r.class || '';
    label.textContent = `${i + 1}. ${traduzir(nomeClasse)}`;
    const pct = (r.probability || r.score || 0) * 100;
    const badge = document.createElement('span');
    badge.className = 'confidence-badge ' + (pct > 75 ? 'confidence-high' : pct > 40 ? 'confidence-medium' : 'confidence-low');
    badge.textContent = `${Math.round(pct)}%`;
    label.appendChild(badge);
    const barraWrap = document.createElement('div');
    barraWrap.className = 'resultado-barra';
    const barra = document.createElement('div');
    barra.className = 'resultado-progresso';
    barra.style.width = '0%';
    setTimeout(() => barra.style.width = Math.min(100, pct) + '%', 50 + i * 120);
    const pctText = document.createElement('div');
    pctText.className = 'resultado-porcentagem';
    pctText.textContent = Math.round(pct) + '%';
    barraWrap.appendChild(barra);
    item.appendChild(label);
    item.appendChild(barraWrap);
    item.appendChild(pctText);
    els.resultado.appendChild(item);
  });
  els.acoesResultado.classList.remove('hidden');
}

function desenharBoundingBoxes(results) {
  const canvas = els.bboxCanvas;
  const img = els.imagemPreview;
  const rect = img.getBoundingClientRect();
  const wrapperRect = els.previewWrapper.getBoundingClientRect();
  canvas.classList.remove('hidden');
  canvas.width = rect.width;
  canvas.height = rect.height;
  canvas.style.left = (rect.left - wrapperRect.left) + 'px';
  canvas.style.top = (rect.top - wrapperRect.top) + 'px';
  const scaleX = rect.width / (img.naturalWidth || rect.width);
  const scaleY = rect.height / (img.naturalHeight || rect.height);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const threshold = parseInt(els.confThreshold?.value || 0) / 100;
  results.forEach(r => {
    if ((r.probability || r.score || 0) < threshold) return;
    const [x, y, w, h] = r.bbox || [0, 0, 0, 0];
    const sx = x * scaleX, sy = y * scaleY, sw = w * scaleX, sh = h * scaleY;
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 3;
    ctx.strokeRect(sx, sy, sw, sh);
    ctx.fillStyle = 'rgba(52, 211, 153, 0.15)';
    ctx.fillRect(sx, sy, sw, sh);
    const label = traduzir(r.className || r.class || '');
    const pct = Math.round((r.probability || r.score || 0) * 100);
    ctx.font = 'bold 13px DM Sans, sans-serif';
    const metrics = ctx.measureText(label + ' ' + pct + '%');
    const padding = 4;
    const textH = 18;
    ctx.fillStyle = 'rgba(52, 211, 153, 0.85)';
    ctx.fillRect(sx, sy - textH - padding * 2, metrics.width + padding * 2, textH + padding * 2);
    ctx.fillStyle = '#07080f';
    ctx.fillText(label + ' ' + pct + '%', sx + padding, sy - padding);
  });
}

function salvarHistoricoEntry(entry) {
  const arr = JSON.parse(localStorage.getItem(HIST_KEY) || '[]');
  arr.unshift(entry);
  if (arr.length > 50) arr.splice(50);
  localStorage.setItem(HIST_KEY, JSON.stringify(arr));
  renderHistoricoUI();
}

function renderHistoricoUI() {
  const arr = JSON.parse(localStorage.getItem(HIST_KEY) || '[]');
  if (!arr.length) {
    els.historico.classList.add('hidden');
    return;
  }
  els.historico.classList.remove('hidden');
  els.historicoLista.innerHTML = '';
  arr.forEach((h) => {
    const div = document.createElement('div');
    div.className = 'historico-item';
    const topResult = (h.results && h.results[0]) ? traduzir(h.results[0].className || h.results[0].class || '') : '—';
    div.innerHTML = `
      <div>
        <div class="historico-item-nome">${h.nome || 'Imagem'}</div>
        <div class="historico-item-data">${new Date(h.date).toLocaleString()}</div>
      </div>
      <div class="historico-item-resultado">${topResult}</div>`;
    els.historicoLista.appendChild(div);
  });
  document.getElementById('estatisticas').classList.remove('hidden');
  els.totalAnalises.textContent = arr.length;
  const freq = {};
  arr.forEach(item => {
    const top = item.results?.[0] ? traduzir(item.results[0].className || item.results[0].class || '') : null;
    if (!top) return;
    freq[top] = (freq[top] || 0) + 1;
  });
  const mais = Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0] || '-';
  els.maisFrequente.textContent = mais;
}

function exportarHistorico() {
  const arr = JSON.parse(localStorage.getItem(HIST_KEY) || '[]');
  if (!arr.length) { showToast('Nenhum histórico para exportar', 'warning'); return; }
  const blob = new Blob([JSON.stringify(arr, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'historico-classificador-ia.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast('Histórico exportado com sucesso!');
}

function mostrarModalConfirmacao() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="modal-box">
      <h3>Limpar histórico?</h3>
      <p>Esta ação não pode ser desfeita. Todas as análises salvas serão removidas.</p>
      <div class="modal-actions">
        <button class="btn-modal-cancel" id="modal-cancel">Cancelar</button>
        <button class="btn-modal-confirm" id="modal-confirm">Limpar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  const cancelar = overlay.querySelector('#modal-cancel');
  const confirmar = overlay.querySelector('#modal-confirm');
  cancelar.focus();
  const fechar = () => { overlay.remove(); };
  cancelar.addEventListener('click', fechar);
  confirmar.addEventListener('click', () => {
    localStorage.removeItem(HIST_KEY);
    renderHistoricoUI();
    showToast('Histórico limpo');
    fechar();
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) fechar(); });
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  localStorage.setItem('ia_tema', isLight ? 'light' : 'dark');
  atualizarIconeTema(isLight);
}

function checkInitialTheme() {
  const temaSalvo = localStorage.getItem('ia_tema');
  const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
  const isLight = temaSalvo ? temaSalvo === 'light' : prefersLight;
  if (isLight) document.body.classList.add('light');
  atualizarIconeTema(isLight);
}

function atualizarIconeTema(isLight) {
  const iconMoon = document.getElementById('theme-icon-moon');
  const iconSun = document.getElementById('theme-icon-sun');
  if (isLight) {
    iconMoon?.classList.add('hidden');
    iconSun?.classList.remove('hidden');
    els.themeToggle.title = 'Alternar para tema escuro';
  } else {
    iconMoon?.classList.remove('hidden');
    iconSun?.classList.add('hidden');
    els.themeToggle.title = 'Alternar para tema claro';
  }
}

function limparAnalise() {
  els.imagemPreview.classList.add('hidden');
  els.videoPreview.classList.add('hidden');
  els.bboxCanvas.classList.add('hidden');
  els.imagemPreview.src = '';
  pararCamera();
  els.resultado.innerHTML = '<div class="resultado-empty">// aguardando análise</div>';
  els.acoesResultado.classList.add('hidden');
  ultimoResultado = [];
}

function baixarResultado() {
  const link = document.createElement('a');
  link.href = els.imagemPreview.src;
  link.download = 'classificacao-ia.jpg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function compartilharResultado() {
  if (!navigator.share) { showToast('Seu navegador não suporta compartilhamento', 'warning'); return; }
  const topResult = ultimoResultado.length ? traduzir(ultimoResultado[0].className || ultimoResultado[0].class || 'minha imagem') : 'minha imagem';
  try {
    const response = await fetch(els.imagemPreview.src);
    const blob = await response.blob();
    const file = new File([blob], 'classificacao-ia.jpg', { type: blob.type });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: 'Resultado da Classificação', text: `Veja o que a IA encontrou: ${topResult}!`, files: [file] });
    } else {
      await navigator.share({ title: 'Resultado da Classificação', text: `Veja o que a IA encontrou: ${topResult}!`, url: window.location.href });
    }
  } catch (err) {
    if (err.name !== 'AbortError') showToast('Compartilhamento falhou: ' + err.message, 'error');
  }
}

function ouvirAtualizacaoSW() {
  if (!navigator.serviceWorker) return;
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SW_UPDATED') {
      els.swBanner?.classList.remove('hidden');
    }
  });
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

function aplicarAtualizacaoSW() {
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
  navigator.serviceWorker.ready.then(reg => {
    reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
  });
}

init();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js')
    .then(() => console.log('Service Worker registrado'))
    .catch(err => console.warn('Falha ao registrar Service Worker:', err));
}
