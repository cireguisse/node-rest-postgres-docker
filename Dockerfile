FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 8080
RUN chown -R node /usr/src/app
USER node

###########
# BUILDER #
###########

# pull official base image
FROM node:14.1-alpine as builder

# create the appropriate directories
ENV APP_HOME=/usr/src/app
RUN mkdir $APP_HOME


# create ARG variables
ARG NODE_VERSION
ARG EXPOSED_PORT
ARG USER
ARG VERSION
ARG MAINTAINER
ARG BUILD_DATE
ARG DESCRIPTION
ARG IS_PRODUCTION
ARG CLI_VERSION

#RUN $(date -u +'%Y-%m-%dT%H:%M:%SZ')
# Set one or more individual labels
LABEL version=${VERSION}
LABEL description=${DESCRIPTION}
LABEL maintainer=${MAINTAINER}
LABEL release-date=${BUILD_DATE}
LABEL version.is-production=${IS_PRODUCTION}

# change to the app user
USER ${USER:-app}

# set work directory
WORKDIR ${APP_HOME]

# install chrome for protractor tests
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update && apt-get install -yq google-chrome-stable

# copy project
COPY . ${APP_HOME]
COPY package.json package-lock.json ${APP_HOME]

# chown all the files to the app user
RUN chown -R app:app ${APP_HOME]

# install  dependencies
RUN npm set progress=false && npm config set depth 0 && npm cache clean --force
RUN npm install
RUN npm run build --prod
RUN npm install -g @angular/cli@${CLI_VERSION}

# copy entrypoint-prod.sh
#COPY ./entrypoint.sh ${APP_HOME]

EXPOSE ${EXPOSED_PORT}

CMD ["node", "server.js"]
