const k8s = require('@kubernetes/client-node');
const axios = require('axios');

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
const k8sNetworkingApi = kc.makeApiClient(k8s.NetworkingV1Api);
const customObjectsApi = kc.makeApiClient(k8s.CustomObjectsApi);

const GROUP = 'stable.dwk';
const VERSION = 'v1';
const PLURAL = 'dummysites';

const log = (level, message, meta = {}) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
    ...meta
  }));
};

const fetchWebsite = async (url) => {
  try {
    log('info', 'Fetching website', { url });
    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'DummySite-Controller/1.0'
      }
    });
    return response.data;
  } catch (error) {
    log('error', 'Failed to fetch website', { 
      url, 
      error: error.message 
    });
    return `<html><body><h1>Error fetching ${url}</h1><p>${error.message}</p></body></html>`;
  }
};

const createConfigMap = async (namespace, name, websiteUrl, content) => {
  const configMapName = `${name}-content`;
  
  const configMap = {
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: {
      name: configMapName,
      labels: {
        'app': name,
        'managed-by': 'dummysite-controller'
      }
    },
    data: {
      'index.html': content,
      'original-url': websiteUrl
    }
  };

  try {
    await k8sApi.createNamespacedConfigMap(namespace, configMap);
    log('info', 'Created ConfigMap', { namespace, name: configMapName });
    return configMapName;
  } catch (error) {
    if (error.response && error.response.statusCode === 409) {
      await k8sApi.replaceNamespacedConfigMap(configMapName, namespace, configMap);
      log('info', 'Updated existing ConfigMap', { namespace, name: configMapName });
      return configMapName;
    }
    throw error;
  }
};

const createDeployment = async (namespace, name, configMapName) => {
  const deployment = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: `${name}-dep`,
      labels: {
        'app': name,
        'managed-by': 'dummysite-controller'
      }
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          app: name
        }
      },
      template: {
        metadata: {
          labels: {
            app: name
          }
        },
        spec: {
          containers: [
            {
              name: 'nginx',
              image: 'nginx:alpine',
              ports: [
                {
                  containerPort: 80,
                  name: 'http'
                }
              ],
              volumeMounts: [
                {
                  name: 'html-content',
                  mountPath: '/usr/share/nginx/html',
                  readOnly: true
                }
              ]
            }
          ],
          volumes: [
            {
              name: 'html-content',
              configMap: {
                name: configMapName
              }
            }
          ]
        }
      }
    }
  };

  try {
    await k8sAppsApi.createNamespacedDeployment(namespace, deployment);
    log('info', 'Created Deployment', { namespace, name: `${name}-dep` });
  } catch (error) {
    if (error.response && error.response.statusCode === 409) {
      await k8sAppsApi.replaceNamespacedDeployment(`${name}-dep`, namespace, deployment);
      log('info', 'Updated existing Deployment', { namespace, name: `${name}-dep` });
    } else {
      throw error;
    }
  }
};

const createService = async (namespace, name) => {
  const service = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: `${name}-svc`,
      labels: {
        'app': name,
        'managed-by': 'dummysite-controller'
      }
    },
    spec: {
      selector: {
        app: name
      },
      ports: [
        {
          port: 80,
          targetPort: 80,
          protocol: 'TCP'
        }
      ],
      type: 'ClusterIP'
    }
  };

  try {
    await k8sApi.createNamespacedService(namespace, service);
    log('info', 'Created Service', { namespace, name: `${name}-svc` });
  } catch (error) {
    if (error.response && error.response.statusCode === 409) {
      await k8sApi.replaceNamespacedService(`${name}-svc`, namespace, service);
      log('info', 'Updated existing Service', { namespace, name: `${name}-svc` });
    } else {
      throw error;
    }
  }
};

const createIngress = async (namespace, name) => {
  const ingress = {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'Ingress',
    metadata: {
      name: `${name}-ingress`,
      labels: {
        'app': name,
        'managed-by': 'dummysite-controller'
      }
    },
    spec: {
      rules: [
        {
          http: {
            paths: [
              {
                path: `/${name}`,
                pathType: 'Prefix',
                backend: {
                  service: {
                    name: `${name}-svc`,
                    port: {
                      number: 80
                    }
                  }
                }
              }
            ]
          }
        }
      ]
    }
  };

  try {
    await k8sNetworkingApi.createNamespacedIngress(namespace, ingress);
    log('info', 'Created Ingress', { namespace, name: `${name}-ingress` });
  } catch (error) {
    if (error.response && error.response.statusCode === 409) {
      await k8sNetworkingApi.replaceNamespacedIngress(`${name}-ingress`, namespace, ingress);
      log('info', 'Updated existing Ingress', { namespace, name: `${name}-ingress` });
    } else {
      throw error;
    }
  }
};

const processDummySite = async (dummySite) => {
  const name = dummySite.metadata.name;
  const namespace = dummySite.metadata.namespace;
  const websiteUrl = dummySite.spec.website_url;

  log('info', 'Processing DummySite', { name, namespace, websiteUrl });

  try {
    const content = await fetchWebsite(websiteUrl);
    const configMapName = await createConfigMap(namespace, name, websiteUrl, content);
    await createDeployment(namespace, name, configMapName);
    await createService(namespace, name);
    await createIngress(namespace, name);

    log('info', 'Successfully processed DummySite', { 
      name, 
      namespace,
      accessPath: `/${name}`
    });
  } catch (error) {
    log('error', 'Failed to process DummySite', { 
      name, 
      namespace, 
      error: error.message 
    });
  }
};

const watchDummySites = async () => {
  log('info', 'Starting to watch DummySites');

  const watch = new k8s.Watch(kc);
  
  const watchCallback = (type, apiObj, watchObj) => {
    if (type === 'ADDED') {
      processDummySite(apiObj);
    } else if (type === 'MODIFIED') {
      processDummySite(apiObj);
    } else if (type === 'DELETED') {
      log('info', 'DummySite deleted', { 
        name: apiObj.metadata.name,
        namespace: apiObj.metadata.namespace
      });
    }
  };

  const errorCallback = (err) => {
    log('error', 'Watch error', { error: err.message });
    setTimeout(() => {
      watchDummySites();
    }, 5000);
  };

  watch.watch(
    `/apis/${GROUP}/${VERSION}/${PLURAL}`,
    {},
    watchCallback,
    errorCallback
  );
};

watchDummySites();
log('info', 'DummySite controller started');
