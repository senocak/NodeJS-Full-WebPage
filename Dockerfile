FROM ubuntu
RUN apt-get update -y && apt-get install -y openssl zip unzip git
RUN apt install -y curl apt-utils procps vim wget
RUN curl -sL https://deb.nodesource.com/setup_13.x | bash -
WORKDIR /app
COPY . /app
RUN apt-get install -y nodejs
RUN npm install
CMD node index.js
EXPOSE 3000



FROM node:10
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
# If you are building your code for production : RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD [ "node", "index.js" ]