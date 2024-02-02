#This is a sample Image 
FROM node:21-alpine
MAINTAINER ralphhanna@hotmail.com 

RUN apk update 
RUN apk upgrade
RUN apk add git 
WORKDIR /app
RUN git clone https://github.com/bpmnServer/bpmn-web.git
WORKDIR bpmn-web
RUN npm install
RUN npm run setup 
RUN sed -i 's/0.0.0.0/mongo/g' .env 
CMD [“npm”,”run start”]
EXPOSE 3000