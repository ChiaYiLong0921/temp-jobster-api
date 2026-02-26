FROM node:20-alpine

COPY package*.json ./
RUN npm ci --omit=dev && \
    apk add --no-cache --update ca-certificates && \
    apk upgrade --no-cache

# Copy the rest of your app code
COPY . .

# Your app runs on 5000 (as we discussed earlier)
EXPOSE 8080

# Start the application
CMD ["node", "app.js"]
