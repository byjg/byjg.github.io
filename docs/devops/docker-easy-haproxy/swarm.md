# Swarm

## Setup Docker EasyHAProxy

This method will use a docker swarm installation to discover the containers and configure the HAProxy.
The advantage of this method is that you can discover containers in other nodes from the cluster.

You cannot mix docker containers with swarm containers.

The only request is that containers and EasyHAProxy must be in the same docker swarm network.
If you don't add to your services the same network EasyHAProxy is connected to, EasyHAProxy will attach it network to your container.

Also, it is highly recommended you create a network external to EasyHAProxy.

e.g.:

```bash
docker network create -d overlay --attachable easyhaproxy
```

And then deploy the EasyHAProxy stack:

```yaml
version: "3"

services:
  haproxy:
    image: byjg/easy-haproxy:4.3.1-rc1
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    deploy:
      replicas: 1
    environment:
      EASYHAPROXY_DISCOVER: swarm
      EASYHAPROXY_SSL_MODE: "loose"
      HAPROXY_CUSTOMERRORS: "true"
      HAPROXY_USERNAME: admin
      HAPROXY_PASSWORD: password
      HAPROXY_STATS_PORT: 1936
    ports:
      - "80:80/tcp"
      - "443:443/tcp"
      - "1936:1936/tcp"
    networks:
      - easyhaproxy

networks:
  easyhaproxy:
    external: true
```

And then:

```bash
docker stack deploy --compose-file docker-compose.yml easyhaproxy
```

Mapping to `/var/run/docker.sock` is necessary to discover the docker containers and get the labels;

**Do not** add more than one replica for EasyHAProxy. To understand that see [limitations](limitations) page.

## Running containers

To make your containers "discoverable" by EasyHAProxy, that is the minimum configuration you need:

```yaml
version: "3"

services:
  container:
    image: my/image:tag
    deploy:
      replicas: 1
      labels:
        easyhaproxy.http.host: host1.local
        easyhaproxy.http.port: 80
        easyhaproxy.http.localport: 8080
    networks:
      - easyhaproxy

networks:
  easyhaproxy:
    external: true
```

Once the container is running, EasyHAProxy will detect automatically and start to redirect all traffic from `example.org:80` to your container.

You don't need to expose any port in your container.

Please follow the [docker label configuration](container-labels) to see other configurations available.

## Setup the EasyHAProxy container

You can configure the behavior of the EasyHAProxy by setup specific environment variables. To get a list of the variables, please follow the [environment variable guide](environment-variable)

## More information

You can refer to the [Docker Documentation](docker) to get other detailed instructions.

----
[Open source ByJG](http://opensource.byjg.com)
