# === Build stage ===
FROM node:22-alpine AS builder

WORKDIR /app

# Instala dependências primeiro (cache de camada Docker)
COPY package.json package-lock.json ./
RUN npm ci

# Copia o código-fonte e faz o build de produção
COPY . .
RUN npm run build

# === Run stage ===
FROM nginx:alpine AS runner

# Copia os artefatos de build para o diretório de serve do nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração do nginx para SPA (history fallback) e headers de cache
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
