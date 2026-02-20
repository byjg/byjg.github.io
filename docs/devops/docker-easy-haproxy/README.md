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

EasyHAProxy dynamically creates `haproxy.cfg` based on metadata from your workloads — Docker labels, Swarm service labels, or Kubernetes Ingress annotations. No HAProxy knowledge required.

## Features

- **Automatic service discovery** — Docker, Docker Swarm, Kubernetes, or static YAML
- **Zero-downtime HAProxy reload** — configuration updates happen without dropping connections
- **Automatic TLS with ACME** — Let's Encrypt, ZeroSSL, BuyPass, and more
- **Custom SSL certificates** — volume-mount or label-embed your own PEM files
- **TCP mode** — proxy any TCP service, not just HTTP
- **Plugin system** — JWT validation, IP whitelisting, Cloudflare IP restoration, FastCGI, path blocking, and custom plugins
- **HAProxy stats dashboard** — optional, password-protected
- **Balance algorithms** — roundrobin, leastconn, source, uri, and more

## Supported platforms

[![Kubernetes](easyhaproxy_kubernetes.png)](getting-started/kubernetes)
[![Docker Swarm](easyhaproxy_swarm.png)](getting-started/swarm)
[![Docker](easyhaproxy_docker.png)](getting-started/docker)
[![Static](easyhaproxy_static.png)](getting-started/static)

Install using tools:

[![Helm](easyhaproxy_helm.png)](guides/helm)
[![MicroK8s](easyhaproxy_microk8s.png)](guides/microk8s)
[![Dokku](easyhaproxy_dokku.png)](guides/dokku)
[![DigitalOcean](easyhaproxy_digitalocean.png)](guides/digitalocean)

## Documentation

| Section | Description |
|---------|-------------|
| **[Getting Started](getting-started/)** | Choose your runtime and discovery mode, minimal working setup |
| **[Guides](guides/ssl)** | SSL, ACME, plugins, Helm, MicroK8s, Dokku, DigitalOcean |
| **[Concepts](concepts/)** | Service discovery, config pipeline, plugin model, TLS termination |
| **[Reference](reference/environment-variables)** | Environment variables, container labels, CLI flags, volumes |

## Who is using?

EasyHAProxy is part of some projects:
- [Dokku](guides/dokku)
- [MicroK8s](guides/microk8s)
- [DigitalOcean Marketplace](guides/digitalocean)

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
