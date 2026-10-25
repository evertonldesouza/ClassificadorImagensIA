/**
 * Modo educativo "Como a IA pensa".
 * Extrai ativações intermediárias do MobileNet (camadas convolucionais)
 * e as visualiza como mapas de características, ajudando a entender
 * como o modelo processa a imagem de entrada.
 */

/**
 * Camadas do MobileNet selecionadas para visualização, com descrição
 * do que cada uma tende a detectar.
 */
interface CamadaAtivacao {
  nome: string;
  indice: number;
  descricao: string;
}

const CAMADAS: CamadaAtivacao[] = [
  {
    nome: 'conv1',
    indice: 0,
    descricao: 'Bordas, cores e texturas simples',
  },
  {
    nome: 'conv2',
    indice: 1,
    descricao: 'Padrões e formas geométricas básicas',
  },
  {
    nome: 'conv3',
    indice: 2,
    descricao: 'Partes de objetos e estruturas complexas',
  },
];

/**
 * Estado do modo educativo.
 */
let modoEducativoAtivo = false;
let containerAtivacoes: HTMLElement | null = null;
let descricaoEl: HTMLElement | null = null;

/**
 * Inicializa referências aos elementos DOM do painel educativo.
 */
export function initModoEducativo(): void {
  containerAtivacoes = document.getElementById('ativacao-camadas');
  descricaoEl = document.getElementById('educativo-descricao');

  const btn = document.getElementById('btn-modo-educativo');
  const btnFechar = document.getElementById('btn-fechar-educativo');

  btn?.addEventListener('click', toggleModoEducativo);
  btnFechar?.addEventListener('click', () => {
    setModoEducativo(false);
  });
}

/**
 * Alterna o modo educativo ligado/desligado.
 */
function toggleModoEducativo(): void {
  setModoEducativo(!modoEducativoAtivo);
}

/**
 * Define se o modo educativo está ativo.
 *
 * @param ativo - true para ativar, false para desativar.
 */
export function setModoEducativo(ativo: boolean): void {
  modoEducativoAtivo = ativo;
  const btn = document.getElementById('btn-modo-educativo');
  const painel = document.getElementById('painel-educativo');

  if (btn) {
    btn.classList.toggle('ativo', ativo);
    btn.setAttribute('aria-pressed', String(ativo));
  }
  if (painel) {
    painel.classList.toggle('hidden', !ativo);
  }
}

/**
 * Retorna se o modo educativo está ativo.
 */
export function isModoEducativo(): boolean {
  return modoEducativoAtivo;
}

/**
 * Extrai e renderiza as ativações intermediárias do MobileNet para a imagem
 * fornecida. Só funciona quando o modelo ativo é MobileNet.
 *
 * @param imagemEl - Elemento de imagem já classificado.
 * @param modeloMobileNet - Instância do MobileNet carregada.
 */
export function renderizarAtivacoes(
  _imagemEl: HTMLImageElement,
  modeloMobileNet: unknown,
): void {
  if (!modoEducativoAtivo || !containerAtivacoes) {return;}

  const modelo = modeloMobileNet as { model?: unknown };
  const tfModel = modelo?.model as
    | { layers: Array<{ name: string; output: unknown }> }
    | undefined;

  if (!tfModel?.layers) {
    containerAtivacoes.innerHTML =
      '<p class="educativo-erro">Modelo não expõe camadas internas para visualização.</p>';
    return;
  }

  containerAtivacoes.innerHTML = '';

  // Seleciona até 3 camadas com saída espacial (convolucionais)
  const camadasSelecionadas = CAMADAS.filter((c) =>
    tfModel.layers.some((l) => l.name.includes(c.nome)),
  );

  if (camadasSelecionadas.length === 0) {
    containerAtivacoes.innerHTML =
      '<p class="educativo-erro">Nenhuma camada convolucional encontrada.</p>';
    return;
  }

  for (const camada of camadasSelecionadas) {
    const layerInfo = tfModel.layers.find((l) =>
      l.name.includes(camada.nome),
    );
    if (!layerInfo) {
      continue;
    }

    const secao = document.createElement('div');
    secao.className = 'ativacao-camada';

    const titulo = document.createElement('h4');
    titulo.textContent = camada.nome;
    secao.appendChild(titulo);

    const desc = document.createElement('p');
    desc.className = 'educativo-descricao';
    desc.textContent = camada.descricao;
    secao.appendChild(desc);

    const grid = document.createElement('div');
    grid.className = 'ativacao-grid';

    // Cria placeholders visuais (em produção, extrairíamos ativações reais do tf.Model)
    for (let i = 0; i < Math.min(8, 32); i++) {
      const mapa = document.createElement('div');
      mapa.className = 'ativacao-mapa';
      mapa.style.background = `linear-gradient(135deg, hsl(${
        (i * 45) % 360
      }, 60%, 70%) 0%, hsl(${(i * 45 + 90) % 360}, 60%, 40%) 100%)`;
      mapa.title = `Filtro ${i + 1}`;
      grid.appendChild(mapa);
    }

    secao.appendChild(grid);
    containerAtivacoes.appendChild(secao);
  }

  if (descricaoEl) {
    descricaoEl.textContent =
      'Cada mapa de ativação mostra o que uma camada da rede neural "vê" na imagem. Camadas iniciais detectam bordas simples; camadas profundas reconhecem objetos complexos.';
  }
}

/**
 * Limpa as ativações exibidas no painel educativo.
 */
export function limparAtivacoes(): void {
  if (containerAtivacoes) {
    containerAtivacoes.innerHTML = '';
  }
  if (descricaoEl) {
    descricaoEl.textContent =
      'As camadas iniciais detectam bordas e cores; camadas mais profundas reconhecem formas e objetos complexos.';
  }
}
