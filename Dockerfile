FROM node:16

WORKDIR /app

ENV DATABASE_URL=mongodb://anotaai:challenge@mongodb:27017/anotaai-challenge?authSource=admin
ENV JWT_SECRET=anotaaiChallenge

COPY package.json .

RUN npm install

COPY . ./

RUN npm run-script build

CMD ["npm", "run-script", "start"]
