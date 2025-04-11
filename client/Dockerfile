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

#& _redirects file - fr spa routing
RUN echo '/* /index.html 200' > dist/_redirects

#~ additional spa routing support
COPY client/netlify.toml dist/

#~ explicit fallback fr SPA routing
RUN echo '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=/"></head><body>Redirecting...</body></html>' > dist/404.html

#~ install sirv better spa routing handling
RUN npm install -g sirv-cli

#~ expose port on which static server will run (e.g., 5000)
EXPOSE 5000

#~ sirv w single-page app mode
CMD ["sirv", "dist", "--port", "5000", "--single"]