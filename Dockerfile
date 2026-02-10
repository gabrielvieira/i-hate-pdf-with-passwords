# Build stage for frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app/FE
COPY FE/package*.json ./
RUN npm install
COPY FE/ ./
RUN npm run build

# Build stage for backend
FROM golang:1.23-alpine AS backend-builder

WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o i-hate-pdf-with-passwords .

# Production stage
FROM ubuntu:24.04

# Avoid interactive prompts during build
ENV DEBIAN_FRONTEND=noninteractive
# go gin production mode
ENV GIN_MODE=release

# Update and install dependencies
RUN apt-get update && apt-get install -y \
    qpdf \
    python3 \
    python3-pip \
    wget \
    git \
    build-essential \
    ocl-icd-opencl-dev \
    pocl-opencl-icd \
    && rm -rf /var/lib/apt/lists/*

# Install pdf2john via pip
RUN pip3 install pdf2john --break-system-packages

# Install hashcat
WORKDIR /opt
RUN wget https://hashcat.net/files/hashcat-6.2.6.tar.gz && \
    tar -xzf hashcat-6.2.6.tar.gz && \
    cd hashcat-6.2.6 && \
    make && \
    make install && \
    cd .. && \
    rm hashcat-6.2.6.tar.gz

# Verify installations
RUN qpdf --version && \
    pdf2john --help && \
    hashcat --version

# Set working directory
WORKDIR /app

# Copy built backend binary
COPY --from=backend-builder /app/i-hate-pdf-with-passwords ./backend/

# Copy built frontend assets
COPY --from=frontend-builder /app/FE/dist ./FE/dist

# Create directories for uploads and results
RUN mkdir -p /app/backend/upload /app/backend/result

# Expose port
EXPOSE 8080

# Run the application
CMD ["/app/backend/i-hate-pdf-with-passwords"]
