# Tuỳ chọn: tự host frontend (mặc định deploy bằng Vercel). Build context = gốc repo.
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /src
COPY . .
RUN pnpm install --frozen-lockfile && pnpm --filter web build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /src /app
EXPOSE 3000
CMD ["pnpm", "--filter", "web", "start"]
