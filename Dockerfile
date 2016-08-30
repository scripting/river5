FROM node:5

CMD ["node", "river5.js"]
EXPOSE 1337

RUN mkdir /app
WORKDIR /app

COPY package.json /app/package.json

RUN npm install

COPY . /app

