FROM nginx:1.21.0-alpine

COPY ./conf.d /etc/nginx/conf.d

ENTRYPOINT ["nginx", "-g", "daemon off;"]
