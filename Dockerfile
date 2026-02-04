# Stage 1: deps
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

# copy only source (dockerignore will help here)
COPY . .

# Next build imports auth/db modules, so ensure DATABASE_URL is non-empty at build time.
ARG DATABASE_URL=postgresql://neondb_owner:npg_5so1VHufYDrq@ep-winter-bread-a7ovf521-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
ENV DATABASE_URL=${DATABASE_URL}

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Stage 3: runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=5055
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 5055
CMD ["node", "server.js"]
