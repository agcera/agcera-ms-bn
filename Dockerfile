FROM debian:bookworm

ARG DEBIAN_FRONTEND=noninteractive

# install postgres + chromium + puppeteer deps
RUN apt update --fix-missing \
    && apt install -y \
        postgresql \
        curl \
        ca-certificates \
        chromium \
        chromium-common \
        fonts-liberation \
        fonts-noto-color-emoji \
        libasound2 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libcups2 \
        libdrm2 \
        libgbm1 \
        libgtk-3-0 \
        libnss3 \
        libpango-1.0-0 \
        libpangocairo-1.0-0 \
        libu2f-udev \
        libvulkan1 \
        libx11-6 \
        libx11-xcb1 \
        libxcb1 \
        libxcomposite1 \
        libxdamage1 \
        libxext6 \
        libxfixes3 \
        libxkbcommon0 \
        libxrandr2 \
        libxss1 \
    && if [ ! -x /usr/bin/chromium ] && [ -x /usr/bin/chromium-browser ]; then ln -s /usr/bin/chromium-browser /usr/bin/chromium; fi \
    && rm -rf /var/lib/apt/lists/*

# Install nvm version manager
ENV NVM_VERSION=0.39.7
ENV NVM_DIR=/usr/local/nvm
RUN mkdir $NVM_DIR
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v$NVM_VERSION/install.sh | bash

# Install node
ENV NODE_VERSION=20.12.1
RUN . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH=$NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH=$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# copy your project in your work directory
RUN mkdir /app
WORKDIR /app
COPY ./database /app/database
COPY ./src /app/src
COPY .sequelizerc pnpm-lock.yaml package.json server.ts start.sh tsconfig.json tsoa.json /app/


# install packages and build
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm run build

# install puppeteer browsers
RUN npx puppeteer browsers install chrome

# allow the start script to be executable
RUN chmod +x start.sh

# expose running port
# to ignore all other setted ports as they won\'t be exposed anyway
ENV PORT=4000
EXPOSE 4000

CMD ["./start.sh"]
