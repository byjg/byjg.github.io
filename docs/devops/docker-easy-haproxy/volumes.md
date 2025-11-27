---
sidebar_position: 13
---

# Volumes

:::info Volume Mapping
These volumes allow you to persist certificates, provide custom configurations, and extend EasyHAProxy functionality.
:::

You can map the following volumes:

| Volume                      | Description                                                                                                                   |
|-----------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| /etc/haproxy/static/        | The folder that will contain the [config.yml](static) file for static configuration                                        |
| /certs/haproxy/             | The folder that will contain the certificates (`PEM`) for the [SSL](ssl)                                                   |
| /certs/certbot/             | The folder that will contain the certificates (`PEM`) processed by Certbot (e.g. Let's Encrypt). More info: [acme](acme).  |
| /etc/haproxy/conf.d/        | The folder that will contain the [custom configuration](other) files.                                                      |
| /etc/haproxy/errors-custom/ | The folder that will contain the [custom error](other) html files.                                                         |

----
[Open source ByJG](http://opensource.byjg.com)
