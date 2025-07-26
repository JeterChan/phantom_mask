FROM node:22-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製應用程式
COPY . .

# expose port 3000
EXPOSE 3000

# 啟動應用程式
CMD ["npm", "run", "dev"]

