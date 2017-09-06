FROM fedora:24

ADD . /code
WORKDIR /code
RUN dnf -y update && dnf -y upgrade
RUN dnf install -y npm

RUN npm install -g npm
RUN npm install -g n
RUN n 6.2.2

RUN npm install

CMD ["node", "app.js"]
