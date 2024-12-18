FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY ./.env /app/build/.env

COPY . .

EXPOSE 3000

CMD npm run dev