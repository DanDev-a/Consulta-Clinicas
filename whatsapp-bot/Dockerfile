FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY dist/ ./dist/

RUN mkdir -p auth_info

EXPOSE 3001

CMD ["node", "dist/index.js"]
