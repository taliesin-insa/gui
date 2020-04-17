FROM node:12.7-alpine AS build
WORKDIR /usr/src/app

EXPOSE 80

WORKDIR /usr/src/app/
COPY . .

RUN npm install
RUN npm run build

FROM nginx:1.17.1-alpine

ADD nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist/taliesin-frontend /usr/share/nginx/html

CMD ["/bin/sh" , "-c" , "sed -i 's/^client_max_body_size.*/client_max_body_size 0;/' /etc/nginx/nginx.conf && exec nginx -g 'daemon off;'"]
