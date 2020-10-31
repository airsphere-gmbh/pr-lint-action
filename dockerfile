FROM node:14.15.0-slim

COPY . .

RUN yarn install --production

ENTRYPOINT ["node", "/dist/main.js"]