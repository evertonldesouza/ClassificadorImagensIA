# 🎯 Classificador de Imagens IA

[![CI](https://github.com/evertonldesouza/ClassificadorImagensIA/actions/workflows/ci.yml/badge.svg)](https://github.com/evertonldesouza/ClassificadorImagensIA/actions/workflows/ci.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-ao%20vivo-2ea44f?logo=github)](https://evertonldesouza.github.io/ClassificadorImagensIA/)
[![Licença](https://img.shields.io/badge/licença-MIT-blue.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00?logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)
[![PWA](https://img.shields.io/badge/PWA- offline--first-2ea44f?logo=googlechrome)](https://web.dev/progressive-web-apps/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-Testing-7EAD33?logo=vitest)](https://vitest.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-Linting-4B32C3?logo=eslint)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-Code%20formatter-F7B93E?logo=prettier)](https://prettier.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E%20Testing-24AD3D?logo=playwright)](https://playwright.dev/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

> Classificador de imagens e detector de objetos com **inteligência artificial executada 100% no navegador** (client-side), sem servidor e sem upload externo. Construído com **TensorFlow.js** (MobileNet + COCO-SSD), empacotado com **Vite**, testado com **Vitest** e entregue como **PWA offline-first**.

🖼️ Demonstração: `Assets/img/ClassificadorIa.gif`

---

## ✨ Funcionalidades

| Área | Recursos |
|------|----------|
| **🧠 IA no navegador** | Classificação com **MobileNet** (1000 classes) e detecção de múltiplos objetos com **COCO-SSD** (bounding boxes). |
| **📷 Entrada de imagem** | Upload de arquivo, **arraste e solte**, captura por **câmera** (frente/trás) e foto em tempo real. |
| **⚡ Tempo real** | Classificação contínua dos frames da câmera (toggle "Tempo Real"). |
| **🎛️ Controle** | Limiar de confiança ajustável, tradução de rótulos EN → PT, compressão automática de imagens. |
| **📊 Histórico** | Histórico de análises salvo localmente, estatísticas (total + mais frequente) e exportação em JSON. |
| **🎨 UX / UI** | Tema claro/escuro com preferência persistida, toasts, skeletons de carregamento, modal de confirmação, atalhos de teclado. |
| **📱 PWA** | Funciona **offline**, instala como app no celular, service worker com cache de modelos e CDNs. |
| **🎓 Modo educativo** | Visualização de ativações intermediárias do MobileNet ("Como a IA pensa") — camadas iniciais detectam bordas, camadas profundas reconhecem objetos. |
| **🐳 Docker** | Dockerfile multi-stage + docker-compose para deploy em qualquer ambiente com um comando. |
| **🧪 E2E** | Testes end-to-end com Playwright (carregamento, tema, modelos, câmera, teclado, upload). |
| **♿ Acessibilidade** | Navegação por teclado, `aria-label`, foco visível, redução de movimento (`prefers-reduced-motion`). |

### Atalhos de teclado
- `C` — ligar/desligar câmera
- `R` — capturar foto
- `1` — modelo MobileNet
- `2` — modelo COCO-SSD
- `Esc` — nova análise / parar tempo real

---

## 🧠 Tecnologias

| Tecnologia | Papel |
|------------|-------|
| **JavaScript (ES Modules)** | Lógica da aplicação, tipagem via JSDoc |
| **Vite** | Servidor de desenvolvimento, build e bundling de produção |
| **TensorFlow.js + MobileNet** | Classificação de imagens (client-side) |
| **TensorFlow.js + COCO-SSD** | Detecção de objetos com bounding box |
| **Vitest** | Testes unitários |
| **ESLint + Prettier** | Lintagem e formatação de código |
| **Service Worker + Manifest** | PWA, cache e uso offline |
| **GitHub Actions** | CI (lint, testes, build) |
| **GitHub Pages** | Hospedagem e deploy automático |

---

## 🏗️ Arquitetura

O código foi modularizado para facilitar manutenção, testes e leitura:

```
src/js/
├── i18n.ts         # Tradução de rótulos (EN → PT) com cache em localStorage
├── models.ts       # Carregamento e cache de modelos (MobileNet / COCO-SSD)
├── classifier.ts   # Classificação, detecção, bounding boxes e compressão
├── camera.ts       # Controle da câmera e classificação em tempo real
├── history.ts      # Histórico de análises e estatísticas (localStorage)
├── ui.ts           # Camada de DOM: toasts, tema, modal, renderização
├── sw.ts           # Registro e atualização do Service Worker (PWA)
├── educational.ts  # Modo educativo: visualização de ativações da IA
└── main.ts         # Ponto de entrada e wiring de eventos/atalhos
├── src/__e2e__/    # Testes end-to-end (Playwright)
├── Dockerfile      # Build multi-stage para produção
├── docker-compose.yml  # Orquestração com nginx
└── docker/nginx.conf   # Configuração do nginx (SPA, cache, segurança)
```

### Fluxo de uma classificação
1. Usuário seleciona imagem (upload, arrasta-solta ou câmera).
2. Imagem é comprimida (canvas → JPEG) para equilibrar desempenho e precisão.
3. Modelo ativo classifica o elemento (`<img>` ou `<video>`).
4. Resultados são normalizados, filtrados pelo limiar de confiança e renderizados com barras de progresso.
5. Se COCO-SSD, bounding boxes são desenhadas em `<canvas>` sobre a imagem.
6. Entrada é salva no histórico (`localStorage`) e as estatísticas são atualizadas.

---

## ⚙️ Como executar

### Pré-requisitos
- Node.js ≥ 18
- Navegador moderno com suporte a WebGL/WebGPU (para aceleração da IA)

### Desenvolvimento
```bash
# Clone o repositório
git clone https://github.com/evertonldesouza/ClassificadorImagensIA.git
cd ClassificadorImagensIA

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento (com recarregamento automático)
npm run dev
```
Abra `http://localhost:5173`. A câmera e o Service Worker exigem HTTP (o Vite já serve por HTTP local).

### Produção
```bash
# Lintagem
npm run lint

# Testes
npm run test

# Build de produção (gera pasta dist/)
npm run build

# Pré-visualizar o build localmente
npm run preview
```

### Scripts disponíveis
| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento com hot reload |
| `npm run build` | Build de produção otimizado (pasta `dist/`) |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Executa ESLint nos fontes |
| `npm run lint:fix` | Corrige problemas de lint automaticamente |
| `npm run type-check` | Verificação de tipos TypeScript |
| `npm run format` | Formata código com Prettier |
| `npm run test` | Executa testes unitários (Vitest) |
| `npm run e2e` | Testes E2E (Playwright) |
| `npm run e2e:install-browsers` | Instala navegadores do Playwright |
| `npm run docker:build` | Constrói a imagem Docker |
| `npm run docker:run` | Executa o contêiner Docker |
| `npm run docker:run` | Executa o contêiner Docker |

---

## 📱 PWA (Progressive Web App)

O projeto é uma PWA completa:
- **`manifest.json`**: metadados, ícones e cor do tema; instalável como app.
- **`service-worker.js`**: cache-first para modelos de IA e CDNs (funciona offline); network-first para arquivos estáticos.
- Atualização do SW notificada via banner ("Nova versão disponível!").

Para testar offline: carregue o app uma vez, ative o modo offline nas DevTools e recarregue.

---

## 📦 Estrutura do repositório

```
ClassificadorImagensIA/
├── index.html               # Ponto de entrada (SEO + Open Graph)
├── manifest.json            # Manifesto da PWA
├── service-worker.js        # Service Worker (offline + cache)
├── package.json             # Dependências e scripts
├── vite.config.js           # Configuração do Vite
├── eslint.config.js         # Regras de lintagem
├── vitest.config.js         # Configuração de testes
├── .prettierrc              # Formatação de código
├── LICENSE                  # MIT
├── CONTRIBUTING.md          # Diretrizes de contribuição
├── README.md                # Este documento
│
├── src/
│   ├── css/style.css        # Estilos (variáveis, tema claro/escuro)
│   ├── js/                  # Módulos ES (veja a arquitetura acima)
│   └── __tests__/           # Testes unitários (i18n, histórico)
│
├── Assets/
│   └── img/ClassificadorIa.gif  # Demonstração animada
│
└── .github/workflows/
    ├── ci.yml               # Integração contínua
    └── pages.yml            # Deploy no GitHub Pages
```

---

## 📈 Qualidade de código

- ✅ ESLint + Prettier configurados e passando
- ✅ Testes unitários com Vitest (módulos puros: i18n, histórico)
- ✅ Build de produção com Vite (bundling, minificação, sourcemaps)
- ✅ GitHub Actions: lint → testes → build em todo push/PR
- ✅ Código modularizado (ES Modules + TypeScript) com documentação JSDoc
- ✅ Testes unitários (Vitest) + testes E2E (Playwright)
- ✅ Sem dependência de CDN em tempo de execução (modelos empacotados via Vite)
- ✅ Dockerfile multi-stage para deploy em qualquer ambiente

---

## 🚀 Roadmap

- [x] Testes de integração (end-to-end com Playwright)
- [x] Modo educativo "Como a IA pensa" (visualização de ativações/camadas)
- [x] Dockerfile multi-stage para deploy em qualquer ambiente
- [ ] Suporte a modelos customizados via Teachable Machine
- [ ] Comparação lado a lado de modelos (MobileNet vs COCO-SSD)
- [ ] Salvamento de resultado como imagem com anotações queimadas

---

## 👨‍💻 Autor

**Everton L.de Souza** — Desenvolvedor .NET e entusiasta de IA aplicada ao front-end.  
📍 Bauru, SP, Brasil  
💼 [LinkedIn](https://www.linkedin.com/in/evertonldesouza/) • 🌐 [GitHub](https://github.com/evertonldesouza)

---

## 📄 Licença

Este projeto é open-source sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
