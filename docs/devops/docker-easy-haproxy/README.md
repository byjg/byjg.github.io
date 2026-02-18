---
sidebar_key: docker-easy-haproxy
---

# EasyHAProxy

[![Sponsor](https://img.shields.io/badge/Sponsor-%23ea4aaa?logo=githubsponsors&logoColor=white&labelColor=0d1117)](https://github.com/sponsors/byjg)
[![Opensource ByJG](https://img.shields.io/badge/opensource-byjg-success.svg)](http://opensource.byjg.com)
[![Build Status](https://github.com/byjg/docker-easy-haproxy/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/byjg/docker-easy-haproxy/actions/workflows/build.yml)
[![GitHub source](https://img.shields.io/badge/Github-source-informational?logo=github)](https://github.com/byjg/docker-easy-haproxy/)
[![GitHub license](https://img.shields.io/github/license/byjg/docker-easy-haproxy.svg)](https://opensource.byjg.com/opensource/licensing.html)
[![GitHub release](https://img.shields.io/github/release/byjg/docker-easy-haproxy.svg)](https://github.com/byjg/docker-easy-haproxy/releases/)
[![Helm Version](https://img.shields.io/badge/dynamic/yaml?color=blue&label=Helm&query=%24.entries.easyhaproxy%5B0%5D.version&url=http%3A%2F%2Fopensource.byjg.com%2Fhelm%2Findex.yaml)](https://opensource.byjg.com/helm)
[![Artifact Hub](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/byjg)](https://artifacthub.io/packages/search?repo=byjg)

![EasyHAProxy](easyhaproxy_logo.png)

## Service discovery for HAProxy

EasyHAProxy dynamically creates the `haproxy.cfg` based on metadata collected from your workloads (Docker labels, Swarm service labels, or Kubernetes ingress annotations).

EasyHAProxy can detect and configure HAProxy automatically on the following platforms:

- Docker
- Docker Swarm
- Kubernetes
- Static YAML definitions (`EASYHAPROXY_DISCOVER=static`)

## Who is using?

EasyHAProxy is part of some projects:
- Dokku
- MicroK8s
- DigitalOcean Marketplace

See detailed instructions on how to install below.

## EasyHAProxy Mission

Easy to set up and low configuration to numerous features. 

## Features

EasyHAProxy will discover services based on Docker (or Swarm) labels and Kubernetes ingress annotations, then dynamically build the `haproxy.cfg`. Below, EasyHAProxy main features:

- Support Automatic Certificate Management Environment (ACME) protocol compatible with Let's Encrypt and other CAs.
- Set your custom SSL certificates
- Balance traffic between multiple replicas
- Set SSL policies (`strict`, `default`, `loose`) via `EASYHAPROXY_SSL_MODE`.
- Set up HAProxy to listen to TCP.
- Add redirects.
- Enable/disable Stats on port 1936 with a custom password.
- Enable/disable custom errors.

Also, it is possible to set up HAProxy from a simple Yaml file instead of creating `haproxy.cfg` file.

## How Does It Work?

You don't need to change your current infrastructure and don't need to learn the HAProxy configuration.

The steps are:

- Run the EasyHAProxy container;
- Add some labels to the containers you want to be parsed by EasyHAProxy (see detailed instructions below);
- EasyHAProxy will automatically detect the containers, set up, and reload the HAProxy configurations for you without downtime.

## Detailed Instructions

For detailed instructions on how to use EasyHAProxy, follow the instructions for the platform you want to use:

[![Kubernetes](easyhaproxy_kubernetes.png)](kubernetes)
[![Docker Swarm](easyhaproxy_swarm.png)](swarm)
[![Docker](easyhaproxy_docker.png)](docker)
[![Static](easyhaproxy_static.png)](static)

Or you can install using tools:

[![Helm](easyhaproxy_helm.png)](helm)
[![MicroK8s](easyhaproxy_microk8s.png)](microk8s)
[![Dokku](easyhaproxy_dokku.png)](dokku)
[![DigitalOcean](easyhaproxy_digitalocean.png)](digitalocean)

## Special Topics

If you already set up the EasyHAProxy, is time to go deeper:

- [Custom SSL](ssl)
- [Automatic Certificate Issuing](acme) (e.g. Letsencrypt)

## Configuration Reference

Detailed configuration guides for advanced setups:

- [Container Labels](container-labels) - Configure Docker/Swarm containers with labels
- [Environment Variables](environment-variable) - Configure EasyHAProxy behavior
- [Volumes](volumes) - Map volumes for certificates, config, and custom files
- [Plugins](plugins) - Extend HAProxy with plugins ([Development Guide](plugin-development))
  - [JWT Validator](Plugins/jwt-validator) - JWT authentication validation
  - [FastCGI](Plugins/fastcgi) - PHP-FPM and FastCGI application support
  - [Cloudflare](Plugins/cloudflare) - Restore visitor IP from Cloudflare CDN
  - [IP Whitelist](Plugins/ip-whitelist) - Restrict access to IPs/CIDR ranges
  - [Deny Pages](Plugins/deny-pages) - Block access to specific paths
  - [Cleanup](Plugins/cleanup) - Automatic cleanup of temporary files
- [Other Configurations](other) - Additional configurations (ports, custom errors, etc.)
- [Limitations](limitations) - Important limitations and considerations

## Development

### Requirements

- Python 3.11 or higher
- [uv](https://github.com/astral-sh/uv) package manager

### Installation for Development

```bash
# Install uv (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Clone the repository
git clone https://github.com/byjg/docker-easy-haproxy.git
cd docker-easy-haproxy

# Install dependencies (creates virtual environment automatically)
uv sync --dev

# Run tests
make test
# or directly: uv run pytest tests/ -vv

# Run linting
make lint

# Format code
make format
```

### Installing the Package

```bash
# Install with uv
uv pip install easymapping

# Or install from source
uv pip install -e ".[dev]"
```

## See EasyHAProxy in action

Click on the image to see the videos (use HD for better visualization)

[![Docker In Action](video-docker.png)](https://youtu.be/ar8raFK0R1k)
[![Docker and Letsencrypt](video-docker-ssl.png)](https://youtu.be/xwIdj9mc2mU)
[![K8s In Action](video-kubernetes.png)](https://youtu.be/uq7TuLIijks)
[![K8s and Letsencrypt](video-kubernetes-letsencrypt.png)](https://youtu.be/v9Q4M5Al7AQ)
[![Static Configuration](video-static.png)](https://youtu.be/B_bYZnRTGJM)
[![TCP Mode](video-tcp-mysql.png)](https://youtu.be/JHqcq9crbDI)

[Here is the code](https://gist.github.com/byjg/e125e478a0562190176d69ea795fd3d4) applied in the test examples above.


----
[Open source ByJG](http://opensource.byjg.com)
