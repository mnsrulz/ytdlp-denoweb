FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

FROM nikolaik/python-nodejs:python3.8-nodejs21-alpine
WORKDIR /app

COPY package*.json ./
COPY --from=builder /app ./
EXPOSE 8000

CMD ["node", "."]