FROM node:14.15.0-slim

COPY . . 

ENTRYPOINT ["node", "/dist/main.js"]