/**
 * Módulo de internacionalização (tradução de rótulos de classes da IA
 * do inglês para o português). Os rótulos vêm dos modelos MobileNet e
 * COCO-SSD, que são treinados em inglês.
 */

/**
 * Dicionário de tradução: rótulo em inglês (chave) → português (valor).
 * @type {Record<string, string>}
 */
const TRADUCOES = {
  // COCO-SSD / objetos do dia a dia
  'coffee mug': 'xícara de café',
  'computer keyboard': 'teclado',
  monitor: 'monitor',
  laptop: 'notebook',
  mouse: 'mouse',
  'remote control': 'controle remoto',
  'cell phone': 'celular',
  book: 'livro',
  clock: 'relógio',
  vase: 'vaso',
  lamp: 'abajur',
  chair: 'cadeira',
  couch: 'sofá',
  bed: 'cama',
  'dining table': 'mesa de jantar',
  toilet: 'vaso sanitário',
  tv: 'televisão',
  microwave: 'micro-ondas',
  oven: 'forno',
  toaster: 'torradeira',
  sink: 'pia',
  refrigerator: 'geladeira',
  bottle: 'garrafa',
  cup: 'copo',
  glass: 'cálice',
  spoon: 'colher',
  fork: 'garfo',
  knife: 'faca',
  bowl: 'tigela',
  banana: 'banana',
  apple: 'maçã',
  orange: 'laranja',
  sandwich: 'sanduíche',
  pizza: 'pizza',
  donut: 'rosquinha',
  cake: 'bolo',
  cookie: 'biscoito',
  'ice cream': 'sorvete',
  'hot dog': 'cachorro-quente',
  person: 'pessoa',
  dog: 'cachorro',
  cat: 'gato',
  horse: 'cavalo',
  bird: 'pássaro',
  fish: 'peixe',
  car: 'carro',
  bicycle: 'bicicleta',
  motorcycle: 'moto',
  airplane: 'avião',
  bus: 'ônibus',
  train: 'trem',
  boat: 'barco',
  'traffic light': 'semáforo',
  'stop sign': 'placa de pare',
  'fire hydrant': 'hidrante',
  'parking meter': 'parquímetro',
  bench: 'banco',
  backpack: 'mochila',
  umbrella: 'guarda-chuva',
  handbag: 'bolsa',
  tie: 'gravata',
  suitcase: 'mala',
  frisbee: 'disco',
  skis: 'esquis',
  snowboard: 'snowboard',
  'sports ball': 'bola esportiva',
  kite: 'pipa',
  'baseball bat': 'taco de beisebol',
  'baseball glove': 'luva de beisebol',
  skateboard: 'skate',
  surfboard: 'prancha de surf',
  'tennis racket': 'raquete de tênis',
  'wine glass': 'taça de vinho',
  'beer bottle': 'garrafa de cerveja',
  phone: 'telefone',
  pen: 'caneta',
  pencil: 'lápis',
  scissors: 'tesoura',
  watch: 'relógio de pulso',
  wallet: 'carteira',
  key: 'chave',
  glasses: 'óculos',
  hat: 'chapéu',
  shoe: 'sapato',
  flower: 'flor',
  tree: 'árvore',
  plant: 'planta',
  camera: 'câmera',
  headphones: 'fones de ouvido',
  microphone: 'microfone',
  'musical instrument': 'instrumento musical',
  guitar: 'violão',
  piano: 'piano',
};

/**
 * Traduz um rótulo de classe da IA para o português, com cache em
 * localStorage para evitar recomputar traduções repetidas.
 *
 * @param {string} texto - Rótulo em inglês retornado pelo modelo.
 * @returns {string} Rótulo traduzido (ou o original, se não houver tradução).
 */
export function traduzir(texto) {
  if (typeof texto !== 'string' || texto.length === 0) {
    return texto;
  }

  const cacheKey = `ia_trad_${texto}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    return cached;
  }

  const encontrado = TRADUCOES[texto.toLowerCase()];
  const resultado = encontrado || texto;

  try {
    localStorage.setItem(cacheKey, resultado);
  } catch {
    // localStorage pode estar indisponível (modo privado/quota excedida)
  }

  return resultado;
}
