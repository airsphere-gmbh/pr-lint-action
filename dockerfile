FROM node:14.15.0-slim

COPY /dist/main.js main.js

ENTRYPOINT ["node", "main.js"]