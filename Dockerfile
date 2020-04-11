FROM node:12.7-alpine AS build
WORKDIR /usr/src/app

EXPOSE 80

WORKDIR /usr/src/app/
COPY . .

RUN npm install
RUN npm run build

FROM nginx:1.17.1-alpine

ADD nginx.conf /etc/nginx/conf.d/default.conf.template
COPY --from=build /usr/src/app/dist/taliesin-frontend /usr/share/nginx/html

# hack to allow to use environment variables in nginx configuration
# https://serverfault.com/a/755541

CMD ["/bin/sh" , "-c" , "envsubst '$AUTH_API_URL $IMPORT_API_URL $DATABASE_API_URL $EXPORT_API_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
