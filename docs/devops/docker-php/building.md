# Building the Image

Docker PHP Image uses [buildah](https://buildah.io/) 
to build a compatible [OCI container image](https://opencontainers.org/).

The image is compatible with all platforms and is capable of running on Docker, 
Podman, Kubernetes, and any other container runtime compatible with the OCI specification.

## Preparing the Environment

Requirements:
* Python 3.x
* buildah

It is not necessary to have Docker installed; however, you need to have `buildah`
on your machine. 

If you are using an Ubuntu/Debian system, you can use the provided script
`install-buildah-ubuntu.sh` to install it. 

## Command to Build

```text
usage: build.py [-h] [--debug] [--build-base]
                [--build-cli] [--build-fpm]
                [--build-fpm-apache] [--build-fpm-nginx]
                [--push] 
                version
```

You can build one image only, but you need to make sure you have the `base` image
on your machine.

## The Configuration File

The configuration for each environment is in the folder `config` and is a YAML
file like this:

```yaml
# The base image to use
image: alpine:edge

# (Optional) If we are getting packages from other resources, define them here
repositories:
  - https://dl-cdn.alpinelinux.org/alpine/edge/testing

# The PHP Version
version:
  major: 8
  minor: 0

# List of extensions to be installed
extensions:
  - (NAME)
  - (NAME)

# The PECL extensions to be installed
pecl:
  - name: xdebug                    # required
    version: 2.5.5                  # optional - if not set, get the latest
    install: False                  # optional - do not call pecl install
    zend: True                      # optional - if true, add as zend extension
    config:                         # optional - if set, add extra config to php.ini 
      - xdebug.remote_port=9001     #            for this extension

# Composer packages to be installed
composer:
  packages:
    - phpunit/phpunit:*
    - squizlabs/php_codesniffer:*
    - phpmd/phpmd:@stable
  links:
    - phpunit
    - phpcs
    - phpbcbf
    - phpmd

# Temporary packages to be used to build the PECL packages 
peclBuildPackages:
  - autoconf
  - build-base

# Permanent packages to be installed in the image
additionalPackages:
  - libssl1.1
  - libcrypto1.1
```

## Example

### Build the Images

```bash
docker run -it --privileged -v /tmp/z:/var/lib/containers -v $PWD:/work -w /work byjg/k8s-ci:latest bash
pip install -r requirements.txt
python3 ./build.py 8.2 --arch amd64 --build-base --build-fpm --build-nginx --debug
```

### Check Images

```bash
buildah images
buildah rmi ...
```
