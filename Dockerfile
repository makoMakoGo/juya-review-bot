FROM node:20-bookworm-slim
LABEL org.opencontainers.image.title="Juya Review Bot" \
      org.opencontainers.image.description="Self-hosted GitHub App review bot powered by OpenCodeReview" \
      org.opencontainers.image.source="https://github.com/makoMakoGo/juya-review-bot" \
      org.opencontainers.image.licenses="Apache-2.0"

ENV NODE_ENV=production \
    OCR_NO_UPDATE=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev \
  && npm install -g @alibaba-group/open-code-review@latest \
  && ocr --version \
  && npm cache clean --force

RUN useradd --create-home --uid 10001 appuser
COPY src ./src
COPY assets ./assets
COPY LICENSE NOTICE /usr/share/licenses/juya-review-bot/
RUN chown -R appuser:appuser /app

EXPOSE 3007
USER appuser
CMD ["node", "src/server.js"]
