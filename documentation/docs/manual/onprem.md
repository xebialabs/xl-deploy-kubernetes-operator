---
sidebar_position: 1
---

# On Premises

Here you will find a recipe of manual actions how to set up k8s cluster for Deploy locally with help of an operator. 

* Go through the process of [scaffolding](../scaffolding.md).
After following these instructions, you'll get on your filesystem the next structure:
```text
bnechyporenko@Bogdan-Nechyporenko xld % ls -al
total 472
drwxr-xr-x  10 bnechyporenko  staff     320 Nov  1 09:40 .
drwxr-xr-x   4 bnechyporenko  staff     128 Nov  3 13:43 ..
-rw-r--r--   1 bnechyporenko  staff     126 Nov  1 09:40 .gitignore
-rw-r--r--   1 bnechyporenko  staff     194 Nov  1 09:40 Dockerfile
-rw-r--r--   1 bnechyporenko  staff    7558 Nov  1 09:40 Makefile
-rw-------   1 bnechyporenko  staff     325 Nov  1 09:41 PROJECT
drwx------  10 bnechyporenko  staff     320 Nov  1 09:41 config
drwxr-xr-x   3 bnechyporenko  staff      96 Nov  1 09:41 helm-charts
-rw-r--r--   1 bnechyporenko  staff     198 Nov  1 09:41 watches.yaml
-rw-r--r--   1 bnechyporenko  staff  214732 Nov  1 09:36 xld.tgz
```
* Create some folder where you can copy and configure the setup. For example `xld-operator-setup`. 
* Copy `config` folder to `xld-operator-setup`. You need only the next 11 files, the rest you can remove:

|Name|Path|
| :---: | :---: |
|cluster-role-digital-proxy-role.yaml|config/rbac/auth_proxy_role.yaml|
|cluster-role-manager-role.yaml|config/rbac/role.yaml|
|cluster-role-metrics-reader.yaml|config/rbac/auth_proxy_client_clusterrole.yaml|
|controller-manager-metrics-service.yaml|config/rbac/auth_proxy_service.yaml|
|custom-resource-definition.yaml|config/crd/bases/xld.my.domain_xldeployhelmcharts.yaml|
|deployment.yaml|config/default/manager_auth_proxy_patch.yaml|
|leader-election-role.yaml|config/rbac/leader_election_role.yaml|
|leader-election-rolebinding.yaml|config/rbac/leader_election_role_binding.yaml|
|manager-rolebinding.yaml|config/rbac/role_binding.yaml|
|proxy-rolebinding.yaml|config/rbac/auth_proxy_role_binding.yaml|
|daideploy_cr.yaml|config/samles/xld_v1alpha1_digitalaideploy.yaml|

That mapping has to be applied in `applications.yaml` file. There you can find 10 references to a file, which initially
points to a template. Example:

`file: !file "kubernetes/template/manager-rolebinding.yaml"`

- Next step is to configure locally Deploy. Make sure, that you have installed Kubernetes plugin. 
- First we will manually create infrastructure CI in Deploy to make sure, that provided values are working against a local
 cluster. I will describe how to do it for a `minikube`, so if you are using something else, some technical details can 
 be a bit different, but the idea is the same. 
  - Start creating CI with type k8s.Master ![k8s master ci creation](./pics/k8smaster-ci-creation.png)
  - Fill in `API server URL` field:
![api server url](./pics/api-server-url.png)
The command to get your server API:
![k8s cluster info](./pics/k8s-cluster-info.png)
  - Next 3 fields are regarding the certifications. Therefore we have first to find the place where they are located. As 
it depends on which profile is activated. Check it with a command `minikube profile`. For example for me, the active profile
is `minikube`, and my certificates are located at:

```text
bnechyporenko@Bogdan-Nechyporenko minikube % ls -al ~/.minikube/profiles/minikube
total 88
drwxr-xr-x  12 bnechyporenko  staff   384 Nov  3 13:57 .
drwxr-xr-x   5 bnechyporenko  staff   160 Nov  1 09:41 ..
-rw-r--r--   1 bnechyporenko  staff  1399 Nov  1 09:42 apiserver.crt
-rw-r--r--   1 bnechyporenko  staff  1399 Nov  1 09:42 apiserver.crt.c7fa3a9e
-rw-------   1 bnechyporenko  staff  1679 Nov  1 09:42 apiserver.key
...
```

and one more in a home directory of `minikube`

```text
bnechyporenko@Bogdan-Nechyporenko minikube % ls -al ~/.minikube
total 56
drwxr-xr-x  19 bnechyporenko  staff   608 Nov  3 13:57 .
drwxr-xr-x+ 85 bnechyporenko  staff  2720 Nov  4 10:19 ..
drwxr-xr-x   2 bnechyporenko  staff    64 Oct 25 15:54 addons
drwxr-xr-x   3 bnechyporenko  staff    96 Oct 27 10:12 bin
-rw-r--r--   1 bnechyporenko  staff  1111 Oct 25 15:56 ca.crt
-rw-------   1 bnechyporenko  staff  1679 Oct 25 15:56 ca.key
-rwxr-xr-x   1 bnechyporenko  staff  1099 Nov  3 13:57 ca.pem
...
```

Knowing all this information, we can fill in next fields:

|Field name|Path to the cert|
| :---: | :---: |
|caCert|~/.minikube/ca.crt|
|tlsCert|~/.minikube/profiles/minikube/apiserver.crt|
|tlsPrivateKey|~/.minikube/profiles/minikube/apiserver.key|

:::tip

You have to provide in the field not a path, but a content.  
Example: ![k8s-cert-fill-in-example](./pics/k8s-cert-fill-in-example.png)

:::

After that we have to verify if the provided configuration is correct, and we can connect to the cluster. For that 
we will use a control task "Check Connection".
![k8s-check-connection](./pics/k8s-check-connection.png)

If everything configured correctly, you should see something like this: 
![k8s-successful-connection](./pics/k8s-successful-connection.png)

- After this success we are ready to fill in the next Yaml file `infrastructure.yaml`
Fill in here these 4 fields: `apiServerURL`, `caCert`, `tlsCert` and `tlsPrivateKey`. 

- Next step is to verify that no mistakes happened during copy-pasting to `infrastructure.yaml`. For that we need to use
[As Code](https://docs.xebialabs.com/v.10.2/deploy/concept/get-started-with-devops-as-code/) feature
 of Deploy to create CIs with help of [XL CLI](https://docs.xebialabs.com/v.10.2/deploy/how-to/install-the-xl-cli/). 
 Please check [XL CLI](https://docs.xebialabs.com/v.10.2/deploy/how-to/install-the-xl-cli/) how to install it.
 Run `xl apply -f infrastructure.yaml` by being in the same directory, or specify the full path to the file. In case you 
 have non-default URL, you have to add this parameter: `--xl-deploy-url YOUR_XL_DEPLOY_URL`
 
- Next thing to tailor few parameters in `xld_v1alpha1_digitalaideploy.yaml`. Copy it from scaffolding folder (you can find it in `config/samples` folder) to a root of `xld-operator-setup` folder.
  - Define or comment  `KeystorePassphrase` and `RepositoryKeystore`
  - Change StorageClass to what you have. For example, you can use 'standard', in case of using local file system. 
It depends [how you configured it](https://xebialabs.github.io/xl-deploy-kubernetes-helm-chart/docs/installing-storage-class). 
  - Define your license in `xldLicense` field, by converting `deployit-license.lic` file's content to base64.
  - Change namespaces in all yaml files to "default", instead of "system"
  - Change for all `kind: ServiceAccount` the name to `default`.
  - Replace the content of `manager_auth_proxy_patch.yaml` to:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    control-plane: controller-manager
  name: xld-operator-controller-manager
spec:
  replicas: 1
  selector:
    matchLabels:
      control-plane: controller-manager
  template:
    metadata:
      labels:
        control-plane: controller-manager
    spec:
      containers:
        - name: kube-rbac-proxy
          image: gcr.io/kubebuilder/kube-rbac-proxy:v0.8.0
          args:
            - "--secure-listen-address=0.0.0.0:8443"
            - "--upstream=http://127.0.0.1:8080/"
            - "--logtostderr=true"
            - "--v=10"
          ports:
            - containerPort: 8443
              name: https
        - name: manager
          args:
            - "--health-probe-bind-address=:8081"
            - "--metrics-bind-address=127.0.0.1:8080"
            - "--leader-elect"
            - "--leader-election-id=xld-operator-controller-manager"
          image: xebialabs/deploy-operator:1.2.0
          livenessProbe:
            httpGet:
              path: /readyz
              port: 8081
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8081
            initialDelaySeconds: 5
            periodSeconds: 10
          resources:
            limits:
              cpu: 100m
              memory: 90Mi
            requests:
              cpu: 100m
              memory: 60Mi
      terminationGracePeriodSeconds: 10
``` 

- Now you are ready to run the complete configuration with:
`xl apply -v -f digital-ai.yaml`
