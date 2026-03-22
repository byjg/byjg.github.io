---
sidebar_position: 4
sidebar_label: "Instance Types"
title: "Instance Types"
---

# Instance Types

Instance types define the CPU and memory resource limits for compute instances.

| Name | CPU | Memory |
|------|-----|--------|
| `nano` | 0.5 cores | 256 MB |
| `micro` | 1 core | 512 MB |
| `small` | 1 core | 1 GB |
| `medium` | 2 cores | 2 GB |
| `large` | 4 cores | 4 GB |
| `xlarge` | 8 cores | 8 GB |

List available types via CLI:

```bash
nimbus compute instance-types
```

The instance type is set with `--type` when creating a compute instance:

```bash
nimbus compute run --name web --swarm SWARM_ID --image nginx --type medium
```

In manifests, use the `type` field:

```yaml
compute:
  web:
    swarm: prod
    image: nginx
    type: medium
```
