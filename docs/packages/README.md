---
id: packages
slug: /packages
sort: 5
tags: [linux, packages, apt, rpm, deb]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Linux Package Repository

Here you can find Linux packages for our opensource projects.

## Setup

<Tabs>
<TabItem value="debian" label="Debian / Ubuntu (APT)" default>

Download the GPG signing key and add the repository:

```bash
sudo mkdir -p /etc/apt/keyrings
sudo curl -fsSL https://opensource.byjg.com/packages/byjg.gpg -o /etc/apt/keyrings/byjg.gpg
sudo tee /etc/apt/sources.list.d/byjg.sources <<EOF
Types: deb
URIs: https://opensource.byjg.com/apt
Suites: /
Signed-By: /etc/apt/keyrings/byjg.gpg
EOF
sudo apt update
```

<details>
<summary>Alternative: one-line format (for older systems)</summary>

```bash
sudo mkdir -p /etc/apt/keyrings
sudo curl -fsSL https://opensource.byjg.com/packages/byjg.gpg -o /etc/apt/keyrings/byjg.gpg
echo "deb [signed-by=/etc/apt/keyrings/byjg.gpg] https://opensource.byjg.com/apt /" | sudo tee /etc/apt/sources.list.d/byjg.list
sudo apt update
```

</details>

</TabItem>
<TabItem value="rpm" label="Fedora / RHEL / CentOS (DNF/Yum)">

Import the GPG signing key and add the repository:

```bash
sudo rpm --import https://opensource.byjg.com/packages/byjg.gpg
sudo tee /etc/yum.repos.d/byjg.repo <<EOF
[byjg]
name=ByJG Packages
baseurl=https://opensource.byjg.com/rpm
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://opensource.byjg.com/packages/byjg.gpg
EOF
```

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
</Tabs>

## List available packages

<Tabs>
<TabItem value="debian" label="Debian / Ubuntu (APT)" default>

```bash
apt list --upgradable 2>/dev/null | grep opensource.byjg.com
```

</TabItem>
<TabItem value="rpm" label="Fedora / RHEL / CentOS (DNF/Yum)">

```bash
dnf list available --repo=byjg
```

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
</Tabs>
