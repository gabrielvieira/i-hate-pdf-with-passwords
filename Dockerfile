FROM ubuntu:24.04

# Avoid interactive prompts during build
ENV DEBIAN_FRONTEND=noninteractive

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

# Set working directory
WORKDIR /workspace

# Verify installations
RUN qpdf --version && \
    pdf2john --help && \
    hashcat --version

CMD ["/bin/bash"]