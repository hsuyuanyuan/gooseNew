# Build stage
FROM rust:bullseye AS builder

SHELL ["/bin/bash", "-c"]

# Install Node.js and any missing dependencies
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get update && apt-get install -y \
    nodejs \
    libdbus-1-dev \
    && rm -rf /var/lib/apt/lists/*

# Create a new directory for the app
WORKDIR /usr/src/goose

# Copy the entire project
COPY . .

# Build the project
RUN cargo build --release

# Runtime stage.  Change from 22.04 to 20.04 to fix the libssl 1.1 not found error when starting the container
FROM ubuntu:20.04

# Configure non-interactive installation
ENV DEBIAN_FRONTEND=noninteractive

# Install runtime libraries with DBus and keyring support
# Ensures curl is installed early
RUN apt-get update && apt-get install -y \
    # Runtime dependencies
    ca-certificates \
    curl \
    gnupg \
    # DBus and keyring
    dbus \
    dbus-x11 \
    gnome-keyring \
    libsecret-1-0 \
    libsecret-tools \
    # Other dependencies
    libssl1.1 \
    libxcb1 \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get update && apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install common development tools
# Ensures tar is available (likely via build-essential)
RUN apt-get update && apt-get install -y \
    # Version control
    git \
    # Text processing and search
    ripgrep \
    fd-find \
    fzf \
    # File manipulation
    jq \
    # Network tools
    wget \
    # Process management
    htop \
    # System utilities
    sudo \
    # Text editors
    nano \
    vim \
    # Archive tools
    zip \
    unzip \
    tar \
    # Build essentials
    build-essential \
    # Python
    python3 \
    python3-pip \
    # Additional tools
    tree \
    tmux \
    && rm -rf /var/lib/apt/lists/*

# << --- Install dependencies for cloudwatch-logs-mcp --- >>
RUN pip3 install --no-cache-dir boto3
# << --- END OF SECTION --- >>

# << --- ADDED SECTION: Install github-mcp-server --- >>
# Define args for version and architecture
ARG MCP_VERSION=latest
ARG MCP_ARCH=x86_64 # Using 64-bit as decided

WORKDIR /tmp

# Download, extract, install, and cleanup MCP Server
RUN echo "Downloading MCP Server version ${MCP_VERSION}, arch ${MCP_ARCH}" && \
    curl -fsSLO "https://github.com/github/github-mcp-server/releases/${MCP_VERSION}/download/github-mcp-server_Linux_${MCP_ARCH}.tar.gz" && \
    tar -xzf "github-mcp-server_Linux_${MCP_ARCH}.tar.gz" -C /tmp && \
    echo "Copying /tmp/github-mcp-server to /usr/local/bin/" && \
    cp /tmp/github-mcp-server /usr/local/bin/github-mcp-server && \
    echo "Setting execute permissions" && \
    chmod +x /usr/local/bin/github-mcp-server && \
    echo "Cleaning up downloaded tarball and extracted binary from /tmp" && \
    rm "github-mcp-server_Linux_${MCP_ARCH}.tar.gz" && \
    rm -f /tmp/github-mcp-server

# << --- END OF ADDED SECTION --- >>

# Install uv using curl
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# Copy the built binaries from the builder stage
COPY --from=builder /usr/src/goose/target/release/goose /usr/local/bin/

# << --- MODIFIED: Download the cloudwatch-logs-mcp script --- >>
# Define the directory and ensure it exists
ARG CW_MCP_DIR=/app/cloudwatch-logs-mcp
RUN mkdir -p ${CW_MCP_DIR}

# Download the script using curl
RUN curl -fsSL -o ${CW_MCP_DIR}/main.py \
    https://raw.githubusercontent.com/serkanh/cloudwatch-logs-mcp/main/main.py

# Optionally make it executable
RUN chmod +x ${CW_MCP_DIR}/main.py
# << --- END OF MODIFIED SECTION --- >>

# Set WORKDIR back if needed, or adjust path in agent code
WORKDIR /app


# Create a wrapper script to initialize DBus and keyring
# (Content provided by user - ensures correct permissions)
RUN echo '#!/bin/bash\n\
# Start DBus session daemon if not running\n\
if [ -z "$DBUS_SESSION_BUS_ADDRESS" ]; then\n\
  eval $(dbus-launch --sh-syntax)\n\
  export DBUS_SESSION_BUS_ADDRESS\n\
fi\n\
\n\
# Initialize keyring if needed\n\
if [ -z "$GNOME_KEYRING_CONTROL" ]; then\n\
  eval $(gnome-keyring-daemon --start)\n\
  export GNOME_KEYRING_CONTROL SSH_AUTH_SOCK\n\
fi\n\
\n\
# Execute the command passed to the script\n\
exec "$@"\n\
' > /usr/local/bin/entrypoint.sh && \
    chmod +x /usr/local/bin/entrypoint.sh

# Set up some basic git config
RUN git config --global init.defaultBranch main && \
    git config --global core.editor "vim"

# Add some helpful aliases
RUN echo 'alias ll="ls -la"' >> ~/.bashrc && \
    echo 'alias fd=fdfind' >> ~/.bashrc

# << --- ADDED: Define container entrypoint and command --- >>
# Use the wrapper script as the entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Define the default command to be executed by the entrypoint script
# This should be your agent application. It needs to launch MCP server internally.
# CMD ["goose"]
# << --- END OF ADDED SECTION --- >>

# Set back to a default working directory if needed (e.g., where code is mounted)
# WORKDIR /root/workspace # Or wherever your compose file mounts code