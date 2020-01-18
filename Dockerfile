FROM node:12.7-alpine AS build
WORKDIR /usr/src/app

EXPOSE 80

WORKDIR /usr/src/app/
COPY . .

RUN npm install
RUN npm run build

FROM nginx:1.17.1-alpine

ADD nginx.conf /etc/nginx/conf.d/taliesin.conf
COPY --from=build /usr/src/app/dist/taliesin-frontend /usr/share/nginx/html
