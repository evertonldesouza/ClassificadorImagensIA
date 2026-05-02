let modelo = null;
let modeloName = 'mobilenet';
let mobilenetModel = null;
let cocoModel = null;
let stream = null;
let currentCameraDeviceId = null;
let ultimoResultado = []; 

const els = {
  btnWebcam: document.getElementById('btn-webcam'),
  btnUpload: document.getElementById('btn-upload'),
  uploadInput: document.getElementById('upload-imagem'),
  areaUpload: document.getElementById('area-upload'),
  imagemPreview: document.getElementById('imagem-preview'),
  videoPreview: document.getElementById('video-preview'),
  resultado: document.getElementById('resultado'),
  acoesResultado: document.getElementById('acoes-resultado'),
  historico: document.getElementById('historico'),
  historicoLista: document.getElementById('historico-lista'),
  statusModelo: document.getElementById('status-modelo'),
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
  themeToggle: document.getElementById('theme-toggle'),
  totalAnalises: document.getElementById('total-analises'),
  maisFrequente: document.getElementById('mais-frequente'),
};

function showToast(message, type='success', duration=3500) {
  const t = document.createElement('div');
  t.className = 'toast ' + (type==='error' ? 'error' : (type==='warning' ? 'warning' : ''));
  t.textContent = message;
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
  els.btnUpload.addEventListener('click', () => {
    els.areaUpload.classList.remove('hidden'); 
  });  
  els.modeloSelect.addEventListener('change', handleModeloChange);

  if (els.btnCapturar) els.btnCapturar.addEventListener('click', capturarFoto);
  if (els.btnParar) els.btnParar.addEventListener('click', pararCamera);
  if (els.btnTrocarCamera) els.btnTrocarCamera.addEventListener('click', trocarCamera);

  if (els.btnLimparHistorico) els.btnLimparHistorico.addEventListener('click', limparHistorico);
  if (els.themeToggle) els.themeToggle.addEventListener('click', toggleTheme);

  if (els.btnDownload) els.btnDownload.addEventListener('click', baixarResultado);
  if (els.btnCompartilhar) els.btnCompartilhar.addEventListener('click', compartilharResultado);
  if (els.btnLimpar) els.btnLimpar.addEventListener('click', limparAnalise);
  
  checkInitialTheme(); 
  
  carregarModelo('mobilenet').catch(err => {
    console.error(err);
    showToast('Erro ao carregar modelo: ' + err.message, 'error');
    els.statusModelo.className = 'status-error';
    els.statusModelo.textContent = 'Erro ao carregar modelo';
  });

  renderHistoricoUI();
}

async function carregarModelo(name) {
  modeloName = name;
  els.modeloProgresso.classList.remove('hidden');
  els.statusModelo.className = 'status-loading';
  els.statusModelo.textContent = 'Carregando modelo de IA...';

  updateProgresso(10, 'Iniciando...');

  if (name === 'mobilenet') {

    updateProgresso(30, 'Baixando weights...');
    mobilenetModel = await mobilenet.load(); 
    modelo = mobilenetModel;
    updateProgresso(100, 'Modelo MobileNet pronto');
  } else if (name === 'coco-ssd') {
    updateProgresso(30, 'Baixando COCO-SSD...');
    
    cocoModel = await cocoSsd.load();
    modelo = cocoModel;
    updateProgresso(100, 'Modelo COCO-SSD pronto');
  }
  els.statusModelo.className = 'status-ready';
  els.statusModelo.textContent = 'Modelo carregado com sucesso!';
  setTimeout(()=> els.modeloProgresso.classList.add('hidden'), 600);

  els.btnWebcam.disabled = false;
  els.btnUpload.disabled = false;
}

function updateProgresso(percent, text) {
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
    
    if (!file.type.startsWith('image/')) { showToast('Arquivo inválido', 'error'); continue; }
    if (file.size > 5 * 1024 * 1024) { showToast('Imagem > 5MB, reduza', 'warning'); continue; }
    const imgUrl = URL.createObjectURL(file);
    await processarImagemUrl(imgUrl, file.name);
    URL.revokeObjectURL(imgUrl);
  }
  e.target.value = ''; 
}


async function processarImagemUrl(url, nome='imagem') {
  els.imagemPreview.classList.remove('hidden');
  els.videoPreview.classList.add('hidden');
  els.imagemPreview.src = url;
  await waitForImageLoad(els.imagemPreview);
  const results = await classificarElemento(els.imagemPreview);
  desenharResultados(results);
  salvarHistoricoEntry({nome, results, date: new Date().toISOString()});
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
    console.error(err);
    showToast('Erro camera: ' + err.message, 'error');
  }
}

async function abrirCamera(deviceId) {
  pararCamera(); // fecha stream anterior se houver
  const constraints = {
    audio: false,
    video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' }
  };
  stream = await navigator.mediaDevices.getUserMedia(constraints);
  els.videoPreview.srcObject = stream;
  els.videoPreview.classList.remove('hidden');
  els.imagemPreview.classList.add('hidden');
  // mostrar controles de camera
  document.getElementById('camera-controls').classList.remove('hidden');
}

function pararCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  els.videoPreview.srcObject = null;
  els.videoPreview.classList.add('hidden');
  document.getElementById('camera-controls').classList.add('hidden');
}

async function trocarCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    if (videoDevices.length < 2) { showToast('Nenhuma outra câmera disponível', 'warning'); return; }
    // encontrar índice atual
    let idx = videoDevices.findIndex(d => d.deviceId === currentCameraDeviceId);
    idx = (idx + 1) % videoDevices.length;
    currentCameraDeviceId = videoDevices[idx].deviceId;
    await abrirCamera(currentCameraDeviceId);
  } catch (err) {
    console.error(err);
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
  const results = await classificarElemento(els.imagemPreview);
  desenharResultados(results);
  salvarHistoricoEntry({nome: 'captura-camera', results, date: new Date().toISOString()});
}


async function classificarElemento(el) {
  if (!modelo) { showToast('Modelo não carregado', 'error'); return []; }

  
  if (modeloName === 'coco-ssd' && modelo.detect) {
    const predictions = await modelo.detect(el);
    
    return predictions.map(p => ({className: p.class, probability: p.score, bbox: p.bbox}));
  }


  const resizedTensor = tf.browser.fromPixels(el).toFloat();
  
  const small = tf.image.resizeBilinear(resizedTensor, [224, 224]);
  const expanded = small.expandDims(0);
  const normalized = expanded.div(255);
  const predictions = await modelo.classify(el); 
  
  tf.dispose([resizedTensor, small, expanded, normalized]);
  
  return predictions.map(p => ({className: p.className, probability: p.probability}));
}


function desenharResultados(results) {
  ultimoResultado = results; 
  els.resultado.innerHTML = '';
  if (!results || results.length === 0) {
    els.resultado.innerHTML = '<div class="resultado-empty">// nenhuma previsão encontrada</div>';
    return;
  }
  results.forEach((r, i) => {
    const item = document.createElement('div');
    item.className = 'resultado-item';
    const label = document.createElement('div');
    label.className = 'resultado-label';
    label.textContent = `${i+1}. ${r.className || r.class} `;
    // badge confiança
    const pct = (r.probability || r.score || 0) * 100;
    const badge = document.createElement('span');
    badge.className = 'confidence-badge ' + (pct > 75 ? 'confidence-high' : (pct > 40 ? 'confidence-medium' : 'confidence-low'));
    badge.textContent = `${Math.round(pct)}%`;
    label.appendChild(badge);

    const barraWrap = document.createElement('div');
    barraWrap.className = 'resultado-barra';
    const barra = document.createElement('div');
    barra.className = 'resultado-progresso';
    barra.style.width = '0%'; 
    setTimeout(()=> barra.style.width = Math.min(100, pct) + '%', 50 + i*120);

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


const HIST_KEY = 'ia_classificador_historico_v1';

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
  arr.forEach((h, idx)=> {
    const div = document.createElement('div');
    div.className = 'historico-item';
    const topResult = (h.results && h.results[0]) ? (h.results[0].className || h.results[0].class) : '—';
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
    const top = item.results && item.results[0] && (item.results[0].className || item.results[0].class);
    if (!top) return;
    freq[top] = (freq[top] || 0) + 1;
  });
  const mais = Object.keys(freq).sort((a,b)=> freq[b] - freq[a])[0] || '-';
  els.maisFrequente.textContent = mais;
}

function limparHistorico() {
  if (!confirm('Limpar histórico?')) return;
  localStorage.removeItem(HIST_KEY);
  renderHistoricoUI();
}


function toggleTheme() {
  const isDarkMode = document.body.classList.toggle('dark-mode');
  
  
  const iconMoon = document.getElementById('theme-icon-moon');
  const iconSun = document.getElementById('theme-icon-sun');

  
  if (isDarkMode) {
    iconMoon.classList.remove('hidden');
    iconSun.classList.add('hidden');
    els.themeToggle.title = 'Alternar para tema claro';
  } else {
    iconMoon.classList.add('hidden');
    iconSun.classList.remove('hidden');
    els.themeToggle.title = 'Alternar para tema escuro';
  }
}

function checkInitialTheme() {
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    
    const iconMoon = document.getElementById('theme-icon-moon');
    const iconSun = document.getElementById('theme-icon-sun');
    
    if (document.body.classList.contains('dark-mode')) {
        iconMoon.classList.remove('hidden');
        iconSun.classList.add('hidden');
        els.themeToggle.title = 'Alternar para tema claro';
    } else {
        iconMoon.classList.add('hidden');
        iconSun.classList.remove('hidden');
        els.themeToggle.title = 'Alternar para tema escuro';
    }
}

function limparAnalise() {
  els.imagemPreview.classList.add('hidden');
  els.videoPreview.classList.add('hidden');
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
  if (!navigator.share) {
    showToast('Seu navegador não suporta compartilhamento', 'warning');
    return;
  }

  const topResult = (ultimoResultado.length > 0) ? (ultimoResultado[0].className || ultimoResultado[0].class) : 'minha imagem';
  const shareText = `Veja o que a IA encontrou na ${topResult}!`;

  try {
    const response = await fetch(els.imagemPreview.src);
    const blob = await response.blob();
    const file = new File([blob], 'classificacao-ia.jpg', { type: blob.type });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'Resultado da Classificação',
        text: shareText,
        files: [file],
      });
    } else {
      await navigator.share({
        title: 'Resultado da Classificação',
        text: shareText,
        url: window.location.href,
      });
    }
  } catch (err) {
    console.error('Erro ao compartilhar:', err);
    if (err.name !== 'AbortError') {
      showToast('Compartilhamento falhou: ' + err.message, 'error');
    }
  }
}



init();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js')
    .then(() => console.log('✅ Service Worker registrado com sucesso'))
    .catch(err => console.warn('⚠️ Falha ao registrar Service Worker:', err));
}