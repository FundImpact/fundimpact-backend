FROM ubuntu:latest
USER root
WORKDIR /home/app
COPY ./package.json /home/app/package.json
RUN apt-get update
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_12.x  | bash -
RUN apt-get -y install nodejs
COPY . /home/app
RUN npm install
RUN npm run-script build
CMD ["npm","start"]


# FROM node:12-slim
# WORKDIR /app
# COPY package.json /app
# RUN npm install
# COPY . /app
# RUN npm run-script build
# CMD ["npm","start"]
