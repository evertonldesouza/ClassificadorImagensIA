# 🎯 Classificador de Imagens IA

[![CI](https://github.com/evertonldesouza/ClassificadorImagensIA/actions/workflows/ci.yml/badge.svg)](https://github.com/evertonldesouza/ClassificadorImagensIA/actions/workflows/ci.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-ao%20vivo-2ea44f?logo=github)](https://evertonldesouza.github.io/ClassificadorImagensIA/)
[![Licença](https://img.shields.io/badge/licença-MIT-blue.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00?logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)
[![PWA](https://img.shields.io/badge/PWA-offline--first-2ea44f?logo=googlechrome)](https://web.dev/progressive-web-apps/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-Testing-7EAD33?logo=vitest)](https://vitest.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-Linting-4B32C3?logo=eslint)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-Code%20formatter-F7B93E?logo=prettier)](https://prettier.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Security](https://img.shields.io/badge/Security-checked-2ea44f?label=Security)](SECURITY.md)

> Classificador de imagens e detector de objetos com **inteligência artificial executada 100% no navegador** (client-side), sem servidor e sem upload externo. Construído com **TensorFlow.js** (MobileNet + COCO-SSD), empacotado com **Vite**, testado com **Vitest** e entregue como **PWA offline-first**.

🖼️ Demonstração: `Assets/img/ClassificadorIa.gif`

---

## 📋 Índice

- [✨ Funcionalidades](#-funcionalidades)
- [🔒 Segurança](#-segurança)
- [🧠 Tecnologias](#-tecnologias)
- [🏗️ Arquitetura](#️-arquitetura)
- [🔄 CI/CD](#-ci-cd)
- [🧪 Testes Automatizados](#-testes-automatizados)
- [⚙️ Como executar](#️-como-executar)
- [📱 PWA](#-pwa-progressive-web-app)
- [📦 Estrutura do repositório](#-estrutura-do-repositório)
- [📈 Qualidade de código](#-qualidade-de-código)
- [🚀 Roadmap](#-roadmap)
- [👨‍💻 Autor](#-autor)
- [📄 Licença](#-licença)

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
| **♿ Acessibilidade** | Navegação por teclado, `aria-label`, foco visível, redução de movimento (`prefers-reduced-motion`). |

### Atalhos de teclado

| Tecla | Ação |
|-------|------|
| `C` | Ligar/desligar câmera |
| `R` | Capturar foto |
| `1` | Selecionar modelo MobileNet |
| `2` | Selecionar modelo COCO-SSD |
| `Esc` | Nova análise / parar tempo real |

---

## 🔒 Segurança

O projeto adota os seguintes padrões de segurança:

### ✅ Padrões implementados

| Padrão | Descrição |
|--------|-----------|
| **Client-side only** | Todo processamento de IA ocorre no navegador; nenhuma imagem é enviada para servidores externos. |
| **Sem CDN em produção** | Modelos TensorFlow.js são empacotados via Vite, não carregados de CDN em tempo de execução. |
| **Headers de segurança** | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer` via nginx. |
| **Service Worker escopo restrito** | Registrado apenas na raiz (`./`) com cache-control adequado. |
| **Validação de entrada** | Arquivos validados por tipo MIME (`image/*`) e tamanho máximo (10 MB) antes do processamento. |
| **Sem dados sensíveis** | Histórico e preferências são armazenados localmente (`localStorage`), nunca enviados a terceiros. |
| **Dependências fixas** | Versões travadas no `package.json` e `package-lock.json` para builds reproduzíveis. |

### 📄 Política de segurança

Consulte o arquivo [`SECURITY.md`](SECURITY.md) para informações sobre relato de vulnerabilidades e nosso processo de resposta a incidentes.

---

## 🧠 Tecnologias

| Tecnologia | Papel |
|------------|-------|
| **JavaScript (ES Modules)** | Lógica da aplicação, tipagem via JSDoc |
| **TypeScript** | Tipagem estática para maior robustez e manutenibilidade |
| **Vite** | Servidor de desenvolvimento, build e bundling de produção |
| **TensorFlow.js + MobileNet** | Classificação de imagens (client-side) |
| **TensorFlow.js + COCO-SSD** | Detecção de objetos com bounding box |
| **Vitest** | Testes unitários |
| **ESLint + Prettier** | Lintagem e formatação de código |
| **Service Worker + Manifest** | PWA, cache e uso offline |
| **GitHub Actions** | CI (lint, testes de tipos, testes unitários, build) |
| **GitHub Pages** | Hospedagem e deploy automático |
| **Docker** | Empacotamento e deploy em qualquer ambiente |

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
```

### Fluxo de uma classificação

1. Usuário seleciona imagem (upload, arrasta-solta ou câmera).
2. Imagem é comprimida (canvas → JPEG) para equilibrar desempenho e precisão.
3. Modelo ativo classifica o elemento (`` ou `<video>`).
4. Resultados são normalizados, filtrados pelo limiar de confiança e renderizados com barras de progresso.
5. Se COCO-SSD, bounding boxes são desenhadas em `<canvas>` sobre a imagem.
6. Entrada é salva no histórico (`localStorage`) e as estatísticas são atualizadas.

---

## 🔄 CI/CD

O projeto utiliza **GitHub Actions** para integração contínua e deploy contínuo.

### 📋 Pipeline de CI (`.github/workflows/ci.yml`)

Executado em todo `push` e `pull request` para a branch `main`:

| Etapa | Comando | Descrição |
|-------|---------|-----------|
| **Checkout** | `actions/checkout@v4` | Baixa o código do repositório |
| **Node.js** | `actions/setup-node@v4` | Configura Node.js 22 com cache de dependências |
| **Instalar dependências** | `npm ci` | Instala dependências travadas no lock file |
| **Lintagem** | `npm run lint` | Executa ESLint nos fontes TypeScript |
| **Verificação de tipos** | `npm run type-check` | Executa `tsc --noEmit` para checagem de tipos |
| **Testes unitários** | `npm run test` | Executa Vitest (testes de módulos puros) |
| **Build de produção** | `npm run build` | Gera pasta `dist/` com bundling e minificação |

### 🚀 Deploy (`.github/workflows/pages.yml`)

Executado em todo `push` para `main`:

1. **Build de produção** via Vite
2. **Upload do artefato** para GitHub Pages
3. **Deploy automático** via `actions/deploy-pages@v4`

### 📊 Status do CI

O status de cada execução pode ser consultado na aba **Actions** do repositório.

---

## 🧪 Testes Automatizados

O projeto adota uma pirâmide de testes com foco em testes unitários rápidos e confiáveis.

### 🧪 Testes unitários (Vitest)

| Módulo | Testes | O que cobre |
|--------|--------|-------------|
| `i18n.ts` | 4 | Tradução EN → PT, cache em localStorage, entrada inválida |
| `history.ts` | 8 | Salvar/listar/limpar histórico, estatísticas, exportação JSON, limite de 50 entradas |
| `classifier.ts` | 2 | Compressão de imagem pequena, classificação sem modelo |

**Total: 14 testes unitários**

### ▶️ Como executar os testes

```bash
# Executar todos os testes
npm run test

# Executar em modo watch
npm run test:watch
```

### 📊 Cobertura

Atualmente os testes cobrem módulos puros de negócio (tradução, histórico, classificação). Módulos de DOM e câmera são testados manualmente devido à dependência de APIs de navegador.

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

# Verificação de tipos TypeScript
npm run type-check

# Testes unitários
npm run test

# Build de produção (gera pasta dist/)
npm run build

# Pré-visualizar o build localmente
npm run preview
```

### Docker

```bash
# Construir a imagem
npm run docker:build

# Executar o contêiner (porta 8080)
npm run docker:run
```

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
├── package-lock.json        # Dependências travadas (builds reproduzíveis)
├── vite.config.js           # Configuração do Vite
├── eslint.config.ts         # Regras de lintagem (ESLint flat config)
├── vitest.config.js         # Configuração de testes (Vitest)
├── tsconfig.json            # Configuração do TypeScript
├── .prettierrc              # Formatação de código
├── .gitignore               # Arquivos ignorados pelo Git
├── .dockerignore            # Arquivos ignorados pelo Docker
├── LICENSE                  # MIT
├── CONTRIBUTING.md          # Diretrizes de contribuição
├── SECURITY.md              # Política de segurança
├── README.md                # Este documento
│
├── src/
│   ├── css/style.css        # Estilos (variáveis, tema claro/escuro)
│   ├── js/                  # Módulos ES Modules com TypeScript
│   │   ├── i18n.ts
│   │   ├── models.ts
│   │   ├── classifier.ts
│   │   ├── camera.ts
│   │   ├── history.ts
│   │   ├── ui.ts
│   │   ├── sw.ts
│   │   ├── educational.ts
│   │   └── main.ts
│   └── __tests__/           # Testes unitários (Vitest)
│
├── docker/
│   ├── Dockerfile           # Build multi-stage para produção
│   └── nginx.conf           # Configuração do nginx (SPA, cache, segurança)
├── docker-compose.yml       # Orquestração com nginx
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

| Item | Status | Descrição |
|------|--------|-----------|
| ESLint + Prettier | ✅ | Lintagem e formatação configuradas e passando |
| TypeScript strict | ✅ | Tipagem estática com `strict: true` no `tsconfig.json` |
| Testes unitários | ✅ | 14 testes passando (Vitest) |
| Build de produção | ✅ | Vite com bundling, minificação e sourcemaps |
| CI/CD | ✅ | GitHub Actions: lint → testes de tipos → testes → build |
| PWA | ✅ | Offline-first com Service Worker e manifest |
| Docker | ✅ | Multi-stage build com nginx |
| Acessibilidade | ✅ | Teclado, ARIA, foco visível, `prefers-reduced-motion` |
| Sem CDN em produção | ✅ | Modelos empacotados via Vite |

---

## 🚀 Roadmap

| Status | Item | Descrição |
|--------|------|-----------|
| ✅ | Testes unitários | Vitest com módulos puros (i18n, histórico, classifier) |
| ✅ | Modo educativo | Visualização de ativações intermediárias do MobileNet |
| ✅ | Docker | Multi-stage para deploy em qualquer ambiente |
| ✅ | CI/CD | GitHub Actions com lint, tipos, testes e build |
| ✅ | Segurança | Headers, client-side only, validação de entrada |
| ⬜ | Modelos customizados | Suporte a modelos via Teachable Machine |
| ⬜ | Comparação lado a lado | MobileNet vs COCO-SSD em tela dividida |
| ⬜ | Salvamento com anotações | Resultado como imagem com bounding boxes queimadas |

---

## 👨‍💻 Autor

**Everton L.de Souza** — Desenvolvedor .NET e entusiasta de IA aplicada ao front-end.  
📍 Bauru, SP, Brasil  
💼 [LinkedIn](https://www.linkedin.com/in/evertonldesouza/) • 🌐 [GitHub](https://github.com/evertonldesouza)

---

## 📄 Licença

Este projeto é open-source sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🤝 Como contribuir

1. Faça um fork do repositório.
2. Crie uma branch a partir de `main`: `git checkout -b feature/nome-da-feature`.
3. Faça suas alterações seguindo os padrões de código existentes.
4. Execute `npm run lint`, `npm run type-check` e `npm run test` antes de commitar.
5. Abra um Pull Request descrevendo a alteração e como testá-la.

Consulte o arquivo [`CONTRIBUTING.md`](CONTRIBUTING.md) para diretrizes detalhadas.
