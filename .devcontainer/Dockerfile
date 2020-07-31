#-------------------------------------------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See https://go.microsoft.com/fwlink/?linkid=2090316 for license information.
#-------------------------------------------------------------------------------------------------------------

# To fully customize the contents of this image, use the following Dockerfile instead:
# https://github.com/microsoft/vscode-dev-containers/tree/v0.128.0/containers/typescript-node-14/.devcontainer/Dockerfile
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-14

ENV APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=true

RUN wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | apt-key add -

RUN echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | tee -a /etc/apt/sources.list.d/elastic-7.x.list

 RUN apt-get update \
 && export DEBIAN_FRONTEND=noninteractive    && apt-get -y install --no-install-recommends elasticsearch htop vim

RUN git config --global core.editor "vim"
RUN update-rc.d elasticsearch defaults 95 10

