# Multi-stage production build for NEXORA C++ Crow Backend Engine
FROM gcc:12-bookworm AS builder

RUN apt-get update && apt-get install -y \
    cmake \
    libpqxx-dev \
    libasio-dev \
    libboost-all-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY CMakeLists.txt .
COPY include/ ./include/
COPY src/ ./src/
COPY tests/ ./tests/

RUN mkdir build && cd build && \
    cmake -DCMAKE_BUILD_TYPE=Release .. && \
    cmake --build .

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    libpqxx-6.4 \
    libstdc++6 \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/build/nexora_server /app/nexora_server

EXPOSE 8080
ENV PORT=8080
ENV ENVIRONMENT=production

CMD ["/app/nexora_server"]

