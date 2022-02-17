FROM node:16.13.1 AS development

COPY ["package.json","yarn.lock","/usr/src/app/"]

WORKDIR /usr/src/app

RUN yarn

COPY [".","."]

EXPOSE 8080

CMD ["node","src/main.ts"]

FROM node:16.13.1 AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY ["package.json","yarn.lock","/usr/src/app/"]

WORKDIR /usr/src/app

RUN yarn

COPY [".","."]

EXPOSE 8080

CMD ["node","dist/main.js"]


