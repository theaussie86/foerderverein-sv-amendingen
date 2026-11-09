# Next.js auf der Bun-Laufzeit. Bun-Version fest, weil Next 16 erst ab Bun 1.4 unter Bun läuft.
FROM oven/bun:1.4.4 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1.4.4 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

FROM oven/bun:1.4.4 AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=bun:bun /app/package.json ./
COPY --from=build --chown=bun:bun /app/node_modules ./node_modules
COPY --from=build --chown=bun:bun /app/.next ./.next
COPY --from=build --chown=bun:bun /app/public ./public
COPY --from=build --chown=bun:bun /app/next.config.ts ./
USER bun
EXPOSE 3000
CMD ["bun", "run", "start"]
