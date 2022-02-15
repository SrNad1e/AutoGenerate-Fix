FROM node:16.13.1

COPY ["package.json","yarn.lock","/app/"]

WORKDIR /usr/src

#RUN npm i -g yarn

RUN yarn

COPY [".","/app/"]

EXPOSE 8080

CMD ["node","src/main.ts"]
