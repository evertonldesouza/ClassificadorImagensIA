# Política de Segurança

## 🛡️ Visão Geral

O **Classificador de Imagens IA** é projetado com foco em privacidade e segurança. Todo o processamento de inteligência artificial ocorre **100% no navegador (client-side)** — nenhuma imagem é enviada para servidores externos, e nenhum dado pessoal é coletado ou armazenado remotamente.

---

## 🔒 Padrões de Segurança Implementados

### 1. Execução 100% no Navegador

- Modelos TensorFlow.js (MobileNet e COCO-SSD) são baixados e executados localmente no navegador do usuário.
- Imagens nunca saem do dispositivo do usuário.
- Não há backend, não há upload externo, não há servidor intermediário.

### 2. Sem Dependência de CDN em Produção

- Todos os modelos de IA são empacotados durante o build com Vite.
- Não há carregamento de scripts de CDN de terceiros em tempo de execução.

### 3. Validação de Entrada

- Arquivos são validados por tipo MIME (`image/*`) antes do processamento.
- Tamanho máximo de 10 MB por imagem.
- Arquivos não-imagem são rejeitados com aviso ao usuário.

### 4. Armazenamento Local Apenas

- Histórico de análises é salvo em `localStorage` do navegador.
- Preferências de tema (claro/escuro) são salvas em `localStorage`.
- Nenhum dado é transmitido para servidores externos.

### 5. Headers de Segurança (via nginx)

Configurados no `docker/nginx.conf`:

| Header | Valor | Propósito |
|--------|-------|-----------|
| `X-Content-Type-Options` | `nosniff` | Previne MIME-type sniffing |
| `X-Frame-Options` | `DENY` | Previne clickjacking |
| `Referrer-Policy` | `no-referrer` | Não envia referer para outros sites |

### 6. Service Worker com Escopo Restrito

- Registrado apenas na raiz (`./`).
- Cache-first para modelos de IA e CDNs.
- Network-first para arquivos estáticos.
- Atualização notificada via banner no aplicativo.

### 7. Dependências Traídas

- Versões fixadas no `package.json` e `package-lock.json`.
- Builds reproduzíveis com `npm ci`.

---

## 📢 Como Relatar uma Vulnerabilidade

Se você descobrir um problema de segurança, por favor **não abra um issue público**. Entre em contato diretamente:

- **Email**: evertonldesouza@proton.me
- **LinkedIn**: https://www.linkedin.com/in/evertonldesouza/

### O que incluir no relato

1. Descrição clara da vulnerabilidade.
2. Passos para reproduzir (se aplicável).
3. Navegador e versão utilizados.
4. Possível impacto e sugestão de correção.

### Prazo de resposta

Tentaremos responder a todos os relatos em até **7 dias úteis** e manter você informado sobre o andamento da correção.

---

## 📦 Dependências de Terceiros

O projeto utiliza as seguintes dependências principais:

| Pacote | Propósito | Versão |
|--------|-----------|--------|
| `@tensorflow/tfjs` | Execução de modelos de IA no navegador | ^4.22.0 |
| `@tensorflow-models/mobilenet` | Modelo de classificação de imagens | ^2.1.1 |
| `@tensorflow-models/coco-ssd` | Modelo de detecção de objetos | ^2.2.3 |
| `vite` | Build tool e servidor de desenvolvimento | ^5.4.10 |
| `vitest` | Framework de testes unitários | ^2.1.3 |
| `eslint` | Lintagem de código | ^9.13.0 |
| `typescript` | Tipagem estática | ^5.7.0 |

Todas as dependências são mantidas atualizadas regularmente para incorporar correções de segurança.

---

## 📄 Licença

Este projeto é licenciado sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
