# DevOps with Kubernetes - Course Submissions

This repository contains my submissions for the [DevOps with Kubernetes](https://devopswithkubernetes.com/) course from the University of Helsinki.

## Exercises

### Part 1

- [1.1.](https://github.com/EngJuanSER/KubernetesSubmission/tree/1.1/log_output) Log output application
- [1.2.](https://github.com/EngJuanSER/KubernetesSubmission/tree/1.2/the_project) Project v0.1 - Basic server
- [1.3.](https://github.com/EngJuanSER/KubernetesSubmission/tree/1.3/log_output) Declarative deployment for log output
- [1.4.](https://github.com/EngJuanSER/KubernetesSubmission/tree/1.4/the_project) Declarative deployment for project
- [1.5.](https://github.com/EngJuanSER/KubernetesSubmission/tree/1.5/the_project) Project v0.2 - HTTP endpoint
- [1.6.](https://github.com/EngJuanSER/KubernetesSubmission/tree/1.6/the_project) Project v0.3 - NodePort Service
- [1.7.](https://github.com/EngJuanSER/KubernetesSubmission/tree/1.7/log_output) Log output with Ingress
- [1.8.](https://github.com/EngJuanSER/KubernetesSubmission/tree/1.8/the_project) Project v0.4 - Ingress
- [1.9.](https://github.com/EngJuanSER/KubernetesSubmission/tree/1.9/ping_pong) Ping-pong app with shared Ingress
- [1.10.](https://github.com/EngJuanSER/KubernetesSubmission/tree/1.10/log_output) Split log-output into writer and reader using emptyDir
- [1.11.](https://github.com/EngJuanSER/KubernetesSubmission/tree/1.11/cluster-resources) Persisting data with PersistentVolumes
- [1.12.](https://github.com/EngJuanSER/KubernetesSubmission/tree/1.12/the_project) Image with hourly caching
- [1.13.](https://github.com/EngJuanSER/KubernetesSubmission/tree/1.13/the_project) Todo form with input and hardcoded list

### Part 2

- [2.1.](https://github.com/EngJuanSER/KubernetesSubmission/tree/2.1) Connect log-output and ping-pong with HTTP
- [2.2.](https://github.com/EngJuanSER/KubernetesSubmission/tree/2.2) Separate backend service for todo management
- [2.3.](https://github.com/EngJuanSER/KubernetesSubmission/tree/2.3) Move log-output and ping-pong to exercises namespace
- [2.4.](https://github.com/EngJuanSER/KubernetesSubmission/tree/2.4) Move project to project namespace
- [2.5.](https://github.com/EngJuanSER/KubernetesSubmission/tree/2.5) Use ConfigMap for log-output configuration
- [2.6.](https://github.com/EngJuanSER/KubernetesSubmission/tree/2.6) Remove hardcoded configurations using ConfigMap
- [2.7.](https://github.com/EngJuanSER/KubernetesSubmission/tree/2.7) Use Postgres StatefulSet for ping-pong counter
- [2.8.](https://github.com/EngJuanSER/KubernetesSubmission/tree/2.8) Use Postgres StatefulSet for todo data persistence
- [2.9.](https://github.com/EngJuanSER/KubernetesSubmission/tree/2.9) Create CronJob to add random Wikipedia article as todo hourly
- [2.10.](https://github.com/EngJuanSER/KubernetesSubmission/tree/2.10) Add monitoring with Prometheus, Grafana and Loki

### Part 3

- [3.1.](https://github.com/EngJuanSER/KubernetesSubmission/tree/3.1) Deploy Ping-pong to GKE with LoadBalancer service
- [3.2.](https://github.com/EngJuanSER/KubernetesSubmission/tree/3.2) Deploy Log-output and Ping-pong with Ingress on GKE
- [3.3.](https://github.com/EngJuanSER/KubernetesSubmission/tree/3.3) Migrate from Ingress to Gateway API
- [3.4.](https://github.com/EngJuanSER/KubernetesSubmission/tree/3.4) URL rewriting with Gateway API
- [3.5.](https://github.com/EngJuanSER/KubernetesSubmission/tree/3.5) Configure todo project with Kustomize for GKE
- [3.6.](https://github.com/EngJuanSER/KubernetesSubmission/tree/3.6) Automatic deployment with GitHub Actions
- [3.7.](https://github.com/EngJuanSER/KubernetesSubmission/tree/3.7) Separate environment per branch
- [3.8.](https://github.com/EngJuanSER/KubernetesSubmission/tree/3.8) Automatic cleanup when branch is deleted
- [3.9.](https://github.com/EngJuanSER/KubernetesSubmission/tree/3.9) DBaaS vs DIY analysis
- [3.10.](https://github.com/EngJuanSER/KubernetesSubmission/tree/3.10) Automated database backups to Google Cloud Storage
- [3.11.](https://github.com/EngJuanSER/KubernetesSubmission/tree/3.11) Resource requests and limits
- [3.12.](https://github.com/EngJuanSER/KubernetesSubmission/tree/3.12) Structured logging for Google Cloud Logging

### Part 4

- [4.1.](https://github.com/EngJuanSER/KubernetesSubmission/tree/4.1) ReadinessProbes for Ping-pong and Log Output
- [4.2.](https://github.com/EngJuanSER/KubernetesSubmission/tree/4.2) ReadinessProbe and LivenessProbe for Todo backend
- [4.3.](https://github.com/EngJuanSER/KubernetesSubmission/tree/4.3) Prometheus query to count StatefulSet pods


## Exercise 3.9: DBaaS vs DIY Analysis

### Comparison Summary

| Aspect | Cloud SQL (DBaaS) | Postgres in K8s (DIY) |
|--------|-------------------|----------------------|
| **Setup Time** | 5-10 minutes | 1-2 hours |
| **Monthly Cost** | $50-200+ | $0.60 + engineering time |
| **Maintenance** | 1-2 hours/month | 10-20 hours/month |
| **Backups** | Automatic daily | Manual setup required |
| **HA** | Built-in failover | Complex to implement |
| **SLA** | 99.95% | None |
| **Control** | Limited | Full |
| **Vendor Lock-in** | Yes | No |

### Cloud SQL (DBaaS) - Pros & Cons

**Pros:**
- Automatic backups with point-in-time recovery (7 days)
- Automated updates and security patches
- Built-in high availability and failover
- Easy scaling with minimal downtime
- Integrated monitoring and alerting
- 99.95% SLA guarantee

**Cons:**
- Higher costs ($50-200/month for small production)
- Vendor lock-in to Google Cloud
- Limited customization options
- Potential latency (requires Cloud SQL Proxy or Private IP)

### Postgres in Kubernetes (DIY) - Pros & Cons

**Pros:**
- Full control over configuration
- Lower direct costs (~$0.60/month for storage)
- No vendor lock-in, portable between clouds
- Minimal network latency (same cluster)
- Valuable learning experience

**Cons:**
- Complex initial setup (StatefulSets, PVCs, Secrets)
- Manual backup implementation required
- No automated failover or HA
- Requires database administration expertise
- Risk of data loss from human error
- No SLA guarantees

### Backup Comparison

| Feature | Cloud SQL | DIY |
|---------|-----------|-----|
| Automation | Daily | Need CronJob |
| Point-in-time recovery | 7 days | Manual |
| Storage management | Automatic | Manual (GCS) |
| Restore process | One-click | Complex |

### Cost Analysis

**Cloud SQL (db-n1-standard-1):**
- Instance: ~$50/month
- Storage (10GB): ~$1.70/month
- **Total: ~$52/month**

**DIY Postgres:**
- GKE storage (10GB PV): ~$0.40/month
- Backup storage (GCS): ~$0.20/month
- **Total: ~$0.60/month**

**Hidden DIY cost:** Engineering time (10-20 hours/month) = $500-1000/month opportunity cost

### Recommendation

**For this educational project:** DIY (Postgres in K8s)
- Learning opportunity
- Minimal budget
- No real users
- Acceptable downtime

**For production:** Cloud SQL
- Reliability critical
- Automatic disaster recovery
- Professional support
- Worth the cost for peace of mind

### Part 4


### Part 5


### Part 6
