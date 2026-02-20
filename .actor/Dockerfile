FROM apify/actor-node:20

COPY --chown=myuser:myuser package*.json ./

RUN npm --quiet set progress=false \
    && npm ci --omit=dev \
    && echo "Installed NPM packages:" \
    && (npm list --omit=dev --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version

COPY --chown=myuser:myuser . ./
