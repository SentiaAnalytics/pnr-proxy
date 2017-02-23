FROM node:7.6
ADD src src

COPY package.json package.json

RUN npm i

ENV CPR_HOST='direkte-demo.cpr.dk'
ENV CPR_USER_ID=
ENV CPR_USERNAME=
ENV CPR_PASSWORD=
ENV AUTH_TOKEN=
ENV PORT=80
EXPOSE 80

CMD npm start
