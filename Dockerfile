FROM node:20-slim

# Install Chromium and Arabic & international fonts for PDF rendering
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-noto-core \
    fonts-noto-cjk \
    fonts-noto-extra \
    fonts-kacst \
    fonts-freefont-ttf \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV CHROME_PATH=/usr/bin/chromium \
    CHROME_BIN=/usr/bin/chromium \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Run the Telegram Bot
CMD ["node", "index.js"]
