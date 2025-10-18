# Use Node.js 20 LTS as base image
FROM node:20-bullseye

# Install development tools and dependencies as root
RUN apt-get update && \
    apt-get install -y \
    git \
    curl \
    wget \
    vim \
    nano \
    build-essential \
    python3 \
    python3-pip \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Set up a non-root user with sudo privileges
RUN useradd -m -s /bin/bash ubuntu && \
    echo 'ubuntu ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Set user and working directory
USER ubuntu
WORKDIR /home/ubuntu

# Install global Node.js tools commonly used in development
RUN npm install -g \
    typescript \
    @types/node \
    vite \
    eslint \
    prettier \
    nodemon \
    pm2

# Set up Git configuration (will be overridden by user settings)
RUN git config --global init.defaultBranch main

# Create a basic .bashrc with useful aliases
RUN echo 'alias ll="ls -la"' >> ~/.bashrc && \
    echo 'alias la="ls -la"' >> ~/.bashrc && \
    echo 'alias ..="cd .."' >> ~/.bashrc

# Expose common development ports
EXPOSE 3000 5173 8080 3001

# Set default command
CMD ["/bin/bash"]
