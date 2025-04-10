FROM node:18-alpine

WORKDIR /app

#& copy pkg files & install dependencies
COPY client/package.json .
COPY client/package-lock.json .  
#^ include lock file if avail
RUN npm install

#~ copy client code & build fr production
COPY client/ .
RUN npm run build

#~ explicit fallback fr SPA routing
RUN echo '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=/"></head><body>Redirecting...</body></html>' > dist/404.html

#~ copy serve.json into build output so "serve" will pick it up
COPY client/serve.json dist/

#~ make sure serve.json is in root of dist dir
RUN ls -la dist/

#~ install static file server to serve production assets
RUN npm install -g serve

#~ expose port on which static server will run (e.g., 5000)
EXPOSE 5000

#~ --single flag w explicit config path fr SPA routing
CMD ["serve", "-s", "dist", "-l", "5000", "--single", "--config", "dist/serve.json"]