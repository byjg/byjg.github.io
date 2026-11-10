---
id: packages
slug: /packages
sort: 5
tags: [linux, macos, packages, apt, rpm, deb, apk, alpine, homebrew]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Package Repository

Here you can find Linux packages for our opensource projects, and a
[Homebrew](https://brew.sh) tap ([byjg/homebrew-tap](https://github.com/byjg/homebrew-tap))
with our command-line tools for macOS and Linux.

## Setup

The repositories are served from `https://packages.byjg.com`. A setup made with
the former `https://opensource.byjg.com` addresses keeps working: they redirect
there.

:::tip One command
On Debian, Ubuntu, Fedora, RHEL and Alpine, the [`byjg-repo`](https://shellscript.download/scripts/byjg-repo)
script of [shellscript.download](https://shellscript.download) does the setup below, signing key
included, and can list and install the packages:

```bash
/bin/bash -c "$(curl -fsSL https://shellscript.download/install/loader)"   # once: installs load.sh
load.sh byjg-repo -- --install <package-name>
```

`load.sh remove -- byjg-repo` takes the repository out again.
:::

<Tabs>
<TabItem value="debian" label="Debian / Ubuntu (APT)" default>

Download the GPG signing key and add the repository:

```bash
sudo mkdir -p /etc/apt/keyrings
sudo curl -fsSL https://packages.byjg.com/byjg.gpg -o /etc/apt/keyrings/byjg.gpg
sudo tee /etc/apt/sources.list.d/byjg.sources <<EOF
Types: deb
URIs: https://packages.byjg.com/apt
Suites: /
Signed-By: /etc/apt/keyrings/byjg.gpg
EOF
sudo apt update
```

<details>
<summary>Alternative: one-line format (for older systems)</summary>

```bash
sudo mkdir -p /etc/apt/keyrings
sudo curl -fsSL https://packages.byjg.com/byjg.gpg -o /etc/apt/keyrings/byjg.gpg
echo "deb [signed-by=/etc/apt/keyrings/byjg.gpg] https://packages.byjg.com/apt /" | sudo tee /etc/apt/sources.list.d/byjg.list
sudo apt update
```

</details>

</TabItem>
<TabItem value="rpm" label="Fedora / RHEL / CentOS (DNF/Yum)">

Import the GPG signing key and add the repository:

```bash
sudo rpm --import https://packages.byjg.com/byjg.asc
sudo tee /etc/yum.repos.d/byjg.repo <<EOF
[byjg]
name=ByJG Packages
baseurl=https://packages.byjg.com/rpm
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://packages.byjg.com/byjg.asc
EOF
```

</TabItem>
<TabItem value="alpine" label="Alpine (APK)">

Install the signing key and add the repository:

```bash
sudo wget -qO /etc/apk/keys/byjg.rsa.pub https://packages.byjg.com/byjg.rsa.pub
echo https://packages.byjg.com/alpine | sudo tee -a /etc/apk/repositories
sudo apk update
```

The key must keep the name `byjg.rsa.pub`: the repository's signature names it.
The repository has amd64 (`x86_64`) and arm64 (`aarch64`) packages.

</TabItem>
<TabItem value="brew" label="macOS / Linux (Homebrew)">

Add the ByJG tap:

```bash
brew tap byjg/tap
```

This step is optional: `brew install byjg/tap/<formula>` adds the tap
automatically. Formulas build from source on your machine, so macOS does not
quarantine the binaries.

</TabItem>
</Tabs>

## Install a package

<Tabs>
<TabItem value="debian" label="Debian / Ubuntu (APT)" default>

```bash
sudo apt install <package-name>
```

</TabItem>
<TabItem value="rpm" label="Fedora / RHEL / CentOS (DNF/Yum)">

```bash
# Fedora / RHEL 8+
sudo dnf install <package-name>

# RHEL 7 / CentOS 7
sudo yum install <package-name>
```

</TabItem>
<TabItem value="brew" label="macOS / Linux (Homebrew)">

```bash
brew install byjg/tap/<formula-name>
```

</TabItem>
<TabItem value="alpine" label="Alpine (APK)">

```bash
sudo apk add <package-name>
```

Run `sudo apk update` first if the package was released in the last hours:
apk can keep an index it fetched recently (`apk update --force-refresh` fetches it again).

</TabItem>
</Tabs>

## List available packages

<Tabs>
<TabItem value="debian" label="Debian / Ubuntu (APT)" default>

```bash
curl -fsSL https://packages.byjg.com/apt/Packages | grep ^Package | sort -u
```

This reads the index from the repository itself. The copy `apt` keeps in
`/var/lib/apt/lists` is compressed on some systems, such as the Docker images.

</TabItem>
<TabItem value="rpm" label="Fedora / RHEL / CentOS (DNF/Yum)">

```bash
dnf repoquery --repo=byjg --available
```

</TabItem>
<TabItem value="alpine" label="Alpine (APK)">

```bash
wget -qO- https://packages.byjg.com/alpine/$(apk --print-arch)/APKINDEX.tar.gz | tar -xzO APKINDEX | sed -n 's/^P://p' | sort -u
```

</TabItem>
<TabItem value="brew" label="macOS / Linux (Homebrew)">

```bash
ls "$(brew --repository byjg/tap)/Formula"
```

The tap has the command-line tools: `parolsh` and `static-httpserver`.

</TabItem>
</Tabs>

## Remove the repository

<Tabs>
<TabItem value="debian" label="Debian / Ubuntu (APT)" default>

```bash
sudo rm /etc/apt/sources.list.d/byjg.sources /etc/apt/keyrings/byjg.gpg
sudo apt update
```

</TabItem>
<TabItem value="rpm" label="Fedora / RHEL / CentOS (DNF/Yum)">

```bash
sudo rm /etc/yum.repos.d/byjg.repo
sudo dnf clean all
```

</TabItem>
<TabItem value="alpine" label="Alpine (APK)">

```bash
sudo sed -i '\|^https://packages.byjg.com/alpine$|d' /etc/apk/repositories
sudo rm /etc/apk/keys/byjg.rsa.pub
```

</TabItem>
<TabItem value="brew" label="macOS / Linux (Homebrew)">

```bash
brew untap byjg/tap
```

Uninstall its formulas first (`brew uninstall <formula-name>`).

</TabItem>
</Tabs>
