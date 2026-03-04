FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN npm install
COPY . .
RUN npm run build -w @autoparts/shared && npm run build -w @autoparts/api
CMD ["sh", "-c", "cd apps/api && npx prisma migrate deploy && npm run start"]
