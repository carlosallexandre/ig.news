FROM node:alpine

WORKDIR /app

# install dependencies
COPY package.json yarn.lock ./
RUN yarn

COPY . .

EXPOSE 3000
CMD yarn dev
