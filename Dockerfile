FROM node:12-slim

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

RUN npm run-script build

CMD ["npm","start"]
