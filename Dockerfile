FROM node:16.13.1
ENV TZ="America/Bogota"

COPY ["package.json","yarn.lock","/app/"]

WORKDIR /app

RUN yarn

COPY [".","."]

EXPOSE 8080

CMD ["node","src/main.ts"]


