FROM node:20-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY server.js .

ENV PORT=10000
EXPOSE 10000

CMD ["node", "server.js"]
