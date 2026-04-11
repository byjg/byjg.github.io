---
sidebar_position: 3
sidebar_label: "First Workload"
title: "Deploy Your First Workload"
---

# Deploy Your First Workload

With nodes registered and ready, here are the main things you can do with DockNimbus.

## Docker Swarm compute instance

```bash
# Create a Docker Swarm group with load balancer
nimbus swarm create --name production --lb
nimbus swarm add-node --swarm SWARM_ID --node NODE_ID

# Launch a compute instance
nimbus compute run --name web-1 --swarm SWARM_ID \
  --image byjg/static-httpserver --type medium \
  --port 80:8080 --env TITLE=soon --env "MESSAGE=Keep In Touch"
```

## Kubernetes cluster

```bash
# Create a K3s cluster
nimbus k8s create-cluster --name dev-k8s --nodes NODE1,NODE2

# Get the kubeconfig
nimbus k8s kubeconfig --name dev-k8s > ~/.kube/dev-k8s.yaml
export KUBECONFIG=~/.kube/dev-k8s.yaml
kubectl get nodes
```

## NFS volume

```bash
# Create a volume and attach to compute
nimbus volume create --name mydata --node NODE_ID --folder /exports/mydata
nimbus compute run --name app --swarm SWARM_ID \
  --image myapp --type small --volume VOL_ID:/data

# Or attach to a K8s cluster (creates PV + PVC)
nimbus k8s volume attach --cluster CLUSTER_ID --name VOL_ID --size 1Gi
```

## S3 storage (MinIO)

```bash
nimbus s3 create --name main-store --swarm SWARM_ID --volume VOL_ID
```

## Docker Compose stack

```bash
nimbus service deploy --name my-stack --swarm SWARM_ID --file docker-compose.yml
```

## Infrastructure as Code

Instead of running individual commands, declare everything in a single YAML manifest:

```bash
nimbus manifest apply --file infra.yaml
```

See the [Manifest guide](../guides/manifest/overview) for details.
