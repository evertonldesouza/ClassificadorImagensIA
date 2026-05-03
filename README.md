# 🎯 Classificador de Imagens com IA

![Status do Projeto](https://img.shields.io/badge/status-concluído-green.svg)
![Licença](https://img.shields.io/badge/licença-MIT-blue.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![TensorFlow](https://img.shields.io/badge/TensorFlow.js-FF6F00?logo=tensorflow&logoColor=white)

> Um projeto interativo desenvolvido em **JavaScript + TensorFlow.js** que permite classificar imagens e detectar objetos em tempo real utilizando **modelos de inteligência artificial** diretamente no navegador — sem servidor, sem upload externo.

---

## 🚀 Funcionalidades

✅ Upload de imagens locais (clique ou **arraste e solte**)  
✅ Uso da câmera em tempo real (captura, troca e parada)  
✅ Classificação com o modelo **MobileNet** (1000 classes)  
✅ Detecção de múltiplos objetos com **COCO-SSD**  
✅ Histórico de análises salvo no navegador  
✅ Estatísticas (total de análises e categoria mais frequente)  
✅ Tema escuro 🌙 / claro ☀️ com **preferência salva entre sessões**  
✅ Toasts com mensagens de status e erros  
✅ Funciona **offline** (PWA)  
✅ Pode ser instalado como aplicativo no celular 💾  

---

## 🧠 Tecnologias utilizadas

| Tecnologia | Descrição |
|---|---|
| **HTML5 / CSS3 / JavaScript** | Estrutura, estilo e lógica do app |
| **TensorFlow.js** | Execução de modelos de IA no navegador |
| **MobileNet** | Classificação de imagens (1000 categorias) |
| **COCO-SSD** | Detecção de múltiplos objetos com bounding box |
| **Service Worker + Manifest (PWA)** | Suporte offline e instalação como app |
| **LocalStorage** | Armazenamento do histórico e preferência de tema |

---

## 🏗️ Estrutura de pastas

```
ClassificadorImagensIA/
│
├── index.html
├── manifest.json
├── service-worker.js
│
└── Assets/
    ├── css/
    │   └── style.css
    ├── img/
    │   └── ClassificadorIa.gif
    └── js/
        └── script.js
```

---

## ⚙️ Como executar o projeto

### 🧩 Pré-requisitos

- Navegador moderno (Chrome, Edge ou Firefox)
- Servidor local — recomendado o **Live Server** do VSCode

> ⚠️ **Importante:** o projeto **não funciona abrindo o `index.html` diretamente** como arquivo (`file://`), pois o Service Worker e a câmera requerem um servidor HTTP.

---

### ▶️ Passos

#### 1. Clone o repositório
```bash
git clone https://github.com/evertonldesouza/ClassificadorImagensIA.git
cd ClassificadorImagensIA
```

#### 2. Abra com o Live Server
- Clique com o botão direito no `index.html` → **"Open with Live Server"**
- Acesse: `http://localhost:5500` (ou a porta exibida no terminal)

#### 3. Permita o uso da câmera, se quiser usar a função de captura.

#### 4. Use offline ou instale como app!
- Após carregar uma vez, funciona sem internet.
- No Chrome → clique em **"Instalar Classificador de Imagens IA"** na barra de endereço.

---

## 🧩 Modelos de IA suportados

| Modelo | Tipo | Características |
|---|---|---|
| **MobileNet** | Classificador | Leve, rápido, identifica 1000 categorias |
| **COCO-SSD** | Detector de objetos | Detecta múltiplos itens simultaneamente |

Você pode alternar entre os modelos pelo seletor de cards na interface do app. O modelo anterior é mantido em memória para troca mais rápida.

---

## 🔧 Detalhes técnicos relevantes

### Como a classificação funciona
O MobileNet recebe diretamente o elemento `<img>` ou `<video>` e realiza o redimensionamento internamente. O COCO-SSD retorna objetos com `class`, `score` e `bbox` (coordenadas do objeto na imagem).

### Gerenciamento de tema
A preferência de tema claro/escuro é salva no `localStorage`. Na próxima visita, o app restaura a última escolha do usuário — com fallback para a preferência do sistema operacional (`prefers-color-scheme`).

### Drag and drop
A área de upload aceita arrastar imagens diretamente da área de trabalho ou de outras janelas do navegador.

### PWA e cache
O Service Worker utiliza duas estratégias de cache:
- **Cache-first** para os modelos de IA e CDNs (evita downloads repetidos e permite uso offline)
- **Network-first** para os arquivos estáticos do app (garante atualizações)

---

## 🧰 PWA – Aplicativo Web Progressivo

### O projeto inclui:
- `manifest.json` — define nome, ícones e cores do app
- `service-worker.js` — faz cache dos arquivos para uso offline

### 🔌 Como testar o modo offline

1. Execute via Live Server ou `npx http-server`
2. Abra DevTools → **Application → Service Workers**
3. Verifique se aparece **"✅ Activated and running"**
4. Desconecte a internet e recarregue → o app continua funcionando!

---

## 🧾 Histórico e estatísticas

O app armazena localmente as análises realizadas:
- Total de classificações
- Categoria mais frequente
- Nome do arquivo e data/hora de cada análise

Você pode limpar o histórico a qualquer momento com o botão **"Limpar Histórico"**.

---

## 💡 Ideias futuras

- [ ] Redimensionamento automático de imagens grandes antes da classificação
- [ ] Tradução automática dos rótulos (inglês → português)
- [ ] Mostrar imagens ilustrativas dos resultados via API do Unsplash
- [ ] Modo educativo "Como a IA pensa" com visualização de ativações
- [ ] Suporte a modelos customizados via Teachable Machine
- [ ] Desenhar bounding boxes na imagem para o COCO-SSD

---

## 👨‍💻 Autor

**Everton L.de Souza**  
Desenvolvedor .NET e entusiasta de IA aplicada ao front-end.  
📍 Brasil  
💼 [LinkedIn](https://www.linkedin.com/in/evertonldesouza/) • 🌐 [GitHub](https://github.com/evertonldesouza)

---

## 🧠 Créditos

- [TensorFlow.js](https://www.tensorflow.org/js)
- [MobileNet](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet)
- [COCO-SSD](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd)
- Interface inspirada em tendências modernas de UI (Glassmorphism + Dark Mode)

---

## 🖼️ Licença

Este projeto é open-source sob a licença **MIT**.  
Sinta-se à vontade para usar, estudar e modificar!