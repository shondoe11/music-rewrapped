FROM node:18-alpine

WORKDIR /app

#& copy pkg files & install dependencies
COPY package.json .
COPY package-lock.json .
#^ include lock file if avail
RUN npm install

#~ copy client code & build fr production
COPY . .
RUN npm run build

#~ install static file server to serve production assets (using the latest version)
RUN npm install -g serve@latest

#~ expose port on which static server will run (e.g., 5000)
EXPOSE 5000

CMD ["serve", "-s", "dist", "-l", "5000"]