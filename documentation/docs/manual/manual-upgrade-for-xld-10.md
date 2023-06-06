---
sidebar_position: 15
---

#  Manual helm to operator upgrade of xld from version 10 to above 22.1 version.

:::caution
This is internal documentation. This document can be used only if it was recommended by the Support Team.
:::

:::caution
This setup is deprecated from the 22.3 version.
:::


## Prerequisites
- The kubectl command-line tool
- Access to a Kubernetes cluster with installed Deploy in the `default` namespace

Tested with:
- Deploy helm based installer version 10.0.0 with external database.
- xl-deploy 10.0 upgraded to 22.1.4 with keycloak disabled.
- xl-cli 22.1.4
- Aws EKS cluster.

## 1. Backup everything
:::caution
Before doing any of the following steps backup everything:
- [Clean up deploy Work directory](https://docs.xebialabs.com/v.22.1/deploy/concept/the-xl-deploy-work-directory/#clean-up-the-work-directory)
- database data
- any custom configuration that was done for the operator setup
    - StatefulSets
    - Deployments
    - ConfigMaps
    - Secrets
    - CustomResource
    - anything else that was customized
- any volume related to deploy master in the default namespace, for example data from the mounted volumes on deploy master pod:
    - /opt/xebialabs/xl-deploy-server/export

- any volume related to deploy worker in the default namespace, for example data from the mounted volumes on deploy worker pod:
    - /opt/xebialabs/xl-deploy-server/work   
:::

## 2. Be sure to not delete PVs with your actions and update PV  RECLAIM POLICY To Retain
Patch the all PVs to set the “persistentVolumeReclaimPolicy” to “Retain”, for example (if cluster admin's didn't do that already):

```shell
> kubectl get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                                                       STORAGECLASS          REASON   AGE
pvc-0e0a6bcd-77e3-4002-a355-2e5a74f637c4   10Gi       RWO            Delete           Bound    default/xld-production-digitalai-deploy                     aws-efs-provisioner            9s
pvc-5728a562-69a3-4fdd-90f8-b5316f7460a0   8Gi        RWO            Delete           Bound    default/data-xld-production-rabbitmq-0                      aws-efs-provisioner            7s
pvc-ef01748d-1d1a-46bf-8e0f-e946a8274b56   5Gi        RWO            Delete           Bound    default/work-dir-xld-production-digitalai-deploy-worker-0   aws-efs-provisioner            7s
...

> kubectl patch pv pvc-0e0a6bcd-77e3-4002-a355-2e5a74f637c4 -p '{"spec":{"persistentVolumeReclaimPolicy":"Retain"}}'
persistentvolume/pvc-0e0a6bcd-77e3-4002-a355-2e5a74f637c4 patched
```

Export the current PVCs objects because it will be necessary to recreate the PVCs in a later stage:
```shell
> kubectl get pvc xld-production-digitalai-deploy -n default -o yaml > pvc-xld-production-digitalai-deploy.yaml

> kubectl get pvc work-dir-xld-production-digitalai-deploy-worker-0 -n default -o yaml > pvc-work-dir-xld-production-digitalai-deploy-worker-0.yaml
```

Iterate on all PVs that are connected to the XLD PVCs in the default namespace, list depends on the installed components.
For example, here is list of PVCs that are usually in the default namespace:
- xld-production-digitalai-deploy
- work-dir-xld-production-digitalai-deploy-worker-0
- data-xld-production-postgresql-0 -- if we are using embedded database
- data-xld-production-rabbitmq-0

On the end check if all PVs have correct Reclaim Policy:

```shell
> kubectl get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                                                       STORAGECLASS          REASON   AGE
pvc-0e0a6bcd-77e3-4002-a355-2e5a74f637c4   10Gi       RWO            Retain           Bound    default/xld-production-digitalai-deploy                     aws-efs-provisioner            2m37s
pvc-5728a562-69a3-4fdd-90f8-b5316f7460a0   8Gi        RWO            Retain           Bound    default/data-xld-production-rabbitmq-0                      aws-efs-provisioner            2m35s
pvc-ef01748d-1d1a-46bf-8e0f-e946a8274b56   5Gi        RWO            Retain           Bound    default/work-dir-xld-production-digitalai-deploy-worker-0   aws-efs-provisioner            2m35s

```
 
## 3. Creating new PVC for dai-deploy master by copying PV data.
:::note
eg: helm release name : xld-production
::: 
### i. Make the copy of the pvc-xld-production-digitalai-deploy.yaml for the later reference.
   ```shell
   > kubectl get pvc xld-production-digitalai-deploy -o yaml > pvc-xld-production-digitalai-deploy.yaml.
   ```
* Copy the pvc-xld-production-digitalai-deploy.yaml file  to pvc-data-dir-dai-xld-digitalai-deploy-master-0.yaml
   ```shell
    > cp pvc-xld-production-digitalai-deploy.yaml pvc-data-dir-dai-xld-digitalai-deploy-master-0.yaml
   ```
  
### ii. Manually create pvc data-dir-dai-xld-digitalai-deploy-master-0 as mentioned below.
 
  * Delete all the lines under sections:
     ```shell
    status
    spec.volumneMode
    spec.volumneName
    metadata.uid
    metadata.resourceVersion
    metadata.namespace
    metadata.creationTimestamp
    metadata.finalizers
    metadata.annotations.pv.kubernetes.io/bind-completed
    metadata.annotations.pv.kubernetes.io/bound-by-controller
    ```
  * Update the following in yaml:
    ```shell
    metadata.name from <release-name>-digitalai-deploy to data-dir-dai-xld-digitalai-deploy-master-0
    metadata.labels.release: dai-xld
    metadata.annotations.meta.helm.sh/release-namespace: default
    metadata.annotations.meta.helm.sh/release-name : dai-xld
    metadata.annotations:helm.sh/resource-policy: keep
    ``` 

### iii.  Create PVC dai-xld-digitalai-deploy.
```shell
> kubectl apply -f pvc-data-dir-dai-xld-digitalai-deploy-master-0.yaml
```
```shell
> kubectl apply -f pvc-data-dir-dai-xld-digitalai-deploy-master-0.yaml 
persistentvolumeclaim/data-dir-dai-xld-digitalai-deploy-master-0 created
```

### iv. Verify if PV bounded
  ```shell
> kubectl get pvc data-dir-dai-xld-digitalai-deploy-master-0
NAME                                         STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS          AGE
data-dir-dai-xld-digitalai-deploy-master-0   Bound    pvc-64444985-8e98-406c-984f-1d12449f039f   10Gi       RWO            aws-efs-provisioner   62s

  
> kubectl get pv pvc-64444985-8e98-406c-984f-1d12449f039f
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                                                STORAGECLASS          REASON   AGE
pvc-64444985-8e98-406c-984f-1d12449f039f   10Gi       RWO            Delete           Bound    default/data-dir-dai-xld-digitalai-deploy-master-0   aws-efs-provisioner            2m54s
  ```
  
### v. Update the Reclaim policy to Retain, for newly created pv of data-dir-dai-xld-digitalai-deploy-master-0.
  ```shell
> kubectl patch pv pvc-64444985-8e98-406c-984f-1d12449f039f -p '{"spec":{"persistentVolumeReclaimPolicy":"Retain"}}';
persistentvolume/pvc-64444985-8e98-406c-984f-1d12449f039f patched
   
> kubectl get pv pvc-64444985-8e98-406c-984f-1d12449f039f
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                                                STORAGECLASS          REASON   AGE
pvc-64444985-8e98-406c-984f-1d12449f039f   10Gi       RWO            Retain           Bound    default/data-dir-dai-xld-digitalai-deploy-master-0   aws-efs-provisioner            3m54s
  ```

### vi. Start the following pod for accessing the newly created PVC [data-dir-dai-xld-digitalai-deploy-master-0].
  
* Update the pod [pod-data-dir-dai-xld-digitalai-deploy-master-0.yaml] yaml with exact volumes which we mounted in previous installation.

```shell
apiVersion: v1
kind: Pod
metadata:
  name: pod-data-dir-dai-xld-digitalai-deploy-master-0
spec:  
  containers:
    - name: sleeper      
      command: ["sleep", "1d"]
      image: xebialabs/tiny-tools:22.2.0
      imagePullPolicy: Always
      volumeMounts:
        - mountPath: /opt/xebialabs/xl-deploy-server/export
          name: export-dir
          subPath: export
  restartPolicy: Never
  volumes:
    - name: export-dir
      persistentVolumeClaim:
        claimName: data-dir-dai-xld-digitalai-deploy-master-0
```

* Start the pod
```shell
> kubectl apply -f pod-data-dir-dai-xld-digitalai-deploy-master-0.yaml
pod/pod-data-dir-dai-xld-digitalai-deploy-master-0 created
 ```

```shell
> kubectl get pod/pod-data-dir-dai-xld-digitalai-deploy-master-0
NAME                                             READY   STATUS    RESTARTS   AGE
pod-data-dir-dai-xld-digitalai-deploy-master-0   1/1     Running   0          30s
```
* Verify the mouted path is available in newly created PV.
 ```shell
> kubectl exec -it pod/pod-data-dir-dai-xld-digitalai-deploy-master-0 -- sh
/ # cd /opt/xebialabs/xl-deploy-server/
/opt/xebialabs/xl-deploy-server # ls -lrt
total 4
drwxrws--x 2 root 40136 6144 Jun 28 09:55 export
/opt/xebialabs/xl-deploy-server #
 ```

### vii. Copy data and Give Persmission.
 * Copy data from xld-production-digitalai-deploy-master-0 to pod-data-dir-dai-xld-digitalai-deploy-master-0

```shell
> kubectl exec -n default xld-production-digitalai-deploy-master-0 -- tar cf - /opt/xebialabs/xl-deploy-server/export | kubectl exec -n default -i pod-data-dir-dai-xld-digitalai-deploy-master-0 -- tar xvf - -C /
  ```
```shell
eg:
> kubectl exec -n default xld-production-digitalai-deploy-master-0 -- tar cf - /opt/xebialabs/xl-deploy-server/export | kubectl exec -n default -i pod-data-dir-dai-xld-digitalai-deploy-master-0 -- tar xvf - -C /
Defaulted container "digitalai-deploy" out of: digitalai-deploy, fix-the-volume-permission (init)
tar: Removing leading `/' from member names
opt/xebialabs/xl-deploy-server/export/
opt/xebialabs/xl-deploy-server/export/test.txt
opt/xebialabs/xl-deploy-server/export/content-types/

```
:::note
  With the Latest version 22.1.4 we are not volume mounting the /opt/xebialabs/xl-deploy-server/export folder, if required , we need to do it manually by editing the statefulset of master pod.
and add the mount path

```shell
> kubectl edit statefulset.apps/dai-xld-digitalai-deploy-master
````
```yaml
- mountPath: /opt/xebialabs/xl-deploy-server/export
  name: data-dir
  subPath: export
```
:::
 * Give full Permission to the copied data in new PV.
  ```shell
> kubectl exec -n default -i pod-data-dir-dai-xld-digitalai-deploy-master-0 -- chmod -R 777 /opt/xebialabs/xl-deploy-server/export

> kubectl exec -it -n default pod-data-dir-dai-xld-digitalai-deploy-master-0 -- sh
/ # cd /opt/xebialabs/xl-deploy-server/
/opt/xebialabs/xl-deploy-server # ls -lrt
total 4
drwxrwsrwx 3 10001 40133 6144 Jun 28 10:00 export
/opt/xebialabs/xl-deploy-server # 
  ```

### viii.  Delete the pod.
```shell
> kubectl delete pod/pod-data-dir-dai-xld-digitalai-deploy-master-0
pod "pod-data-dir-dai-xld-digitalai-deploy-master-0" deleted
```
## 4. Creating new PVC for dai-deploy worker by copying PV data.
:::note
eg: helm release name : xld-production
:::
### i. Make the copy of the pvc-work-dir-xld-production-digitalai-deploy-worker-0.yaml for the later reference.
   ```shell
   > kubectl get pvc work-dir-xld-production-digitalai-deploy-worker-0 -o yaml > pvc-work-dir-xld-production-digitalai-deploy-worker-0.yaml
   ```
* Copy the pvc-work-dir-xld-production-digitalai-deploy-worker-0.yaml file  to pvc-data-dir-dai-xld-digitalai-deploy-worker-0.yaml
  ```shell
   > cp pvc-work-dir-xld-production-digitalai-deploy-worker-0.yaml pvc-data-dir-dai-xld-digitalai-deploy-worker-0.yaml
  ```

### ii. Manually create pvc data-dir-dai-xld-digitalai-deploy-worker-0 as mentioned below.

* Delete all the lines under sections:
   ```shell
  status
  spec.volumneMode
  spec.volumneName
  metadata.uid
  metadata.resourceVersion
  metadata.namespace
  metadata.creationTimestamp
  metadata.finalizers
  metadata.annotations.pv.kubernetes.io/bind-completed
  metadata.annotations.pv.kubernetes.io/bound-by-controller
  ```
* Update the following in yaml:
  ```shell
  metadata.name from work-dir-<release-name>-digitalai-deploy-worker-0 to data-dir-dai-xld-digitalai-deploy-worker-0
  metadata.labels.release: dai-xld
  metadata.annotations.meta.helm.sh/release-namespace: default
  metadata.annotations.meta.helm.sh/release-name : dai-xld
  metadata.annotations:helm.sh/resource-policy: keep
  ``` 

### iii.  Create PVC dai-xld-digitalai-deploy.
```shell
> kubectl apply -f pvc-data-dir-dai-xld-digitalai-deploy-worker-0.yaml
```
```shell
> kubectl apply -f pvc-data-dir-dai-xld-digitalai-deploy-worker-0.yaml
persistentvolumeclaim/data-dir-dai-xld-digitalai-deploy-worker-0 created
```

### iv. Verify if PV bounded
  ```shell
> kubectl get pvc data-dir-dai-xld-digitalai-deploy-worker-0
NAME                                         STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS          AGE
data-dir-dai-xld-digitalai-deploy-worker-0   Bound    pvc-5ad67b27-027c-4636-b2b6-8a1e288c6251   5Gi        RWO            aws-efs-provisioner   27s
  
> kubectl get pv pvc-5ad67b27-027c-4636-b2b6-8a1e288c6251
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                                                STORAGECLASS          REASON   AGE
pvc-5ad67b27-027c-4636-b2b6-8a1e288c6251   5Gi        RWO            Delete           Bound    default/data-dir-dai-xld-digitalai-deploy-worker-0   aws-efs-provisioner            51s

  ```

### v. Update the Reclaim policy to Retain, for newly created pv of data-dir-dai-xld-digitalai-deploy-worker-0.
  ```shell
> kubectl patch pv pvc-5ad67b27-027c-4636-b2b6-8a1e288c6251 -p '{"spec":{"persistentVolumeReclaimPolicy":"Retain"}}';
persistentvolume/pvc-5ad67b27-027c-4636-b2b6-8a1e288c6251 patched
> kubectl get pv pvc-5ad67b27-027c-4636-b2b6-8a1e288c6251
   NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                               STORAGECLASS          REASON   AGE
   pvc-dad9e7c3-ae1b-4b28-b595-4f4b281a0bf2   5Gi        RWO            Retain           Bound    default/data-dir-dai-xld-digitalai-deploy-worker-0   aws-efs-provisioner            3m40s
  ```

### vi. Start the following pod for accessing the newly created PVC [data-dir-dai-xld-digitalai-deploy-worker-0].

* Update the pod [pod-data-dir-dai-xld-digitalai-deploy-worker-0.yaml] yaml with exact volumes which we mounted in previous installation.
```shell
apiVersion: v1
kind: Pod
metadata:
  name: pod-data-dir-dai-xld-digitalai-deploy-worker-0
spec:  
  containers:
    - name: sleeper      
      command: ["sleep", "1d"]
      image: xebialabs/tiny-tools:22.2.0
      imagePullPolicy: Always
      volumeMounts:
        - mountPath: /opt/xebialabs/xl-deploy-server/work
          name: data-dir
          subPath: work           
  restartPolicy: Never
  volumes:
    - name: data-dir
      persistentVolumeClaim:
        claimName: data-dir-dai-xld-digitalai-deploy-worker-0
  ```

* Start the pod
```shell
> kubectl apply -f pod-data-dir-dai-xld-digitalai-deploy-worker-0.yaml
pod/pod-data-dir-dai-xld-digitalai-deploy-worker-0 created
  ```
  ```shell
> kubectl get pod/pod-data-dir-dai-xld-digitalai-deploy-worker-0
NAME                                             READY   STATUS    RESTARTS   AGE
pod-data-dir-dai-xld-digitalai-deploy-worker-0   1/1     Running   0          24s
  ```
* Verify the mounted path is available in newly created PV.
```shell
> kubectl exec -it pod/pod-data-dir-dai-xld-digitalai-deploy-worker-0 -- sh
/ # cd /opt/xebialabs/xl-deploy-server/
/opt/xebialabs/xl-deploy-server # ls -lrt
total 4
drwxrws--x 2 root 40137 6144 Jun 28 11:01 work
/opt/xebialabs/xl-deploy-server # 
```

### vii. Copy data and Give Persmission.
* Copy data from xld-production-digitalai-deploy-worker-0 to pod-data-dir-dai-xld-digitalai-deploy-worker-0

```shell
    > kubectl exec -n default xld-production-digitalai-deploy-worker-0 -- tar cf - /opt/xebialabs/xl-deploy-server/work | kubectl exec -n default -i pod-data-dir-dai-xld-digitalai-deploy-worker-0 -- tar xvf - -C /
  ```
```shell
eg:
 > kubectl exec -n default xld-production-digitalai-deploy-worker-0 -- tar cf - /opt/xebialabs/xl-deploy-server/work | kubectl exec -n default -i pod-data-dir-dai-xld-digitalai-deploy-worker-0 -- tar xvf - -C /
Defaulted container "digitalai-deploy" out of: digitalai-deploy, fix-the-volume-permission (init)
tar: Removing leading `/' from member names
opt/xebialabs/xl-deploy-server/work/
opt/xebialabs/xl-deploy-server/work/task-20220628T111235796.1976/
opt/xebialabs/xl-deploy-server/work/1d2e8d97-b433-4f92-bd56-96db8f11842c.task
```
* Give full Permission to the copied data in new PV.
```shell
 > kubectl exec -n default -i pod-data-dir-dai-xld-digitalai-deploy-worker-0 -- chmod -R 777 /opt/xebialabs/xl-deploy-server/work

 > kubectl exec -it -n default pod-data-dir-dai-xld-digitalai-deploy-worker-0 -- sh
/ # cd /opt/xebialabs/xl-deploy-server/
/opt/xebialabs/xl-deploy-server # ls -lrt
total 4
drwxrwsrwx 3 10001 40134 6144 Jun 28 11:13 work
/opt/xebialabs/xl-deploy-server #
```

### viii.  Delete the pod.
```shell
 > kubectl delete pod/pod-data-dir-dai-xld-digitalai-deploy-worker-0
pod "pod-data-dir-dai-xld-digitalai-deploy-worker-0" deleted
```

## 5. Run upgrade with dry run, with custom zip options.
  ```shell
    > xl op --upgrade --dry-run
  ```
* Sample output.
```shell
 > .xl_22.1.4 op --upgrade --dry-run
? Select the setup mode? advanced
? Select the Kubernetes setup where the digitalai Devops Platform will be installed or uninstalled: AwsEKS [AWS EKS]
? Do you want to use Kubernetes' current-context from ~/.kube/config? Yes
? Do you want to use the AWS SSO credentials ? No
? Do you want to use the AWS credentials from your ~/.aws/credentials file? Yes
? Do you want to use an existing Kubernetes namespace? Yes
? Enter the name of the existing Kubernetes namespace where the XebiaLabs DevOps Platform will be installed, updated or undeployed: default
Connecting to EKS
? Product server you want to perform upgrade for daiDeploy [Digital.ai Deploy]
? Enter the repository name(eg: <repositoryName>/<imageName>:<tagName>) xebialabs
? Enter the deploy server image name(eg: <repositoryName>/<imageName>:<tagName>) xl-deploy
? Enter the image tag(eg: <repositoryName>/<imageName>:<tagName>) 22.1.4
? Enter the deploy task engine image name for version 22 and above (eg: <repositoryName>/<imageName>:<tagName>) deploy-task-engine
? Choose the version of the XL Deploy for Upgrader setup of operator 22.1.4
? Use embedded keycloak? No
? Select the type of upgrade you want. helmToOperator [Helm to Operator]
? Operator image to use xebialabs/deploy-operator:22.1.4
? Do you want to use custom operator zip file for Deploy? Yes
? Deploy operator zip to use (absolute path or URL to the zip) /home/sishwarya/SprintTicket/S-84982_ns_xld_migration/helmToOperator/dryrun/deploy-operator-aws-eks-22.1.4.zip
? Edit list of custom resource keys that will migrate to the new Deploy CR <Received>
? Enter the helm release name. xld-production
	 -------------------------------- ----------------------------------------------------
	| LABEL                          | VALUE                                              |
	 -------------------------------- ----------------------------------------------------
	| AWSAccessKey                   | *****                                              |
	| AWSAccessSecret                | *****                                              |
	| AWSSessionToken                | *****                                              |
	| DeployImageVersionForUpgrader  | 22.1.4                                             |
	| EksClusterName                 | devops-operator-cluster-test-cluster               |
	| ImageNameDeploy                | xl-deploy                                          |
	| ImageNameDeployTaskEngine      | deploy-task-engine                                 |
	| ImageTag                       | 22.1.4                                             |
	| IsAwsCfgAvailable              | true                                               |
	| K8sApiServerURL                | https://72673EC78289B3B122CAC4CA8E6473C2.gr7.us-.. |
	| K8sSetup                       | AwsEKS                                             |
	| Namespace                      | default                                            |
	| OperatorImageDeployGeneric     | xebialabs/deploy-operator:22.1.4                   |
	| OperatorZipDeploy              | /home/sishwarya/SprintTicket/S-84982_ns_xld_migr.. |
	| OsType                         | linux                                              |
	| PreserveCrValuesDeploy         | .spec.XldMasterCount\n.spec.XldWorkerCount\n.spe.. |
	| ReleaseName                    | xld-production                                     |
	| RepositoryName                 | xebialabs                                          |
	| ServerType                     | daiDeploy                                          |
	| UpgradeType                    | helmToOperator                                     |
	| UseAWSSsoCredentials           | false                                              |
	| UseAWSconfig                   | true                                               |
	| UseCustomNamespace             | true                                               |
	| UseEmbeddedKeycloak            | false                                              |
	| UseKubeconfig                  | true                                               |
	| UseOperatorZipDeploy           | true                                               |
	 -------------------------------- ----------------------------------------------------
? Do you want to proceed to the deployment with these values? Yes
Generated files successfully! 
Creating original custom resource file...	\ Generated files successfully helmToOperator upgrade on AwsEKS 
```

## 5. Take backup of existing password.

```shell  
  ## To get the password for postgresql, run: only when we use embedded database
   > kubectl get secret --namespace default xld-production-postgresql -o jsonpath="{.data.postgresql-password}" | base64 --decode; echo
  
  ## To get the admin password for xl-deploy, run:
   >kubectl get secret --namespace default xld-production-digitalai-deploy -o jsonpath="{.data.deploy-password}" | base64 --decode; echo

  ## To get the password for rabbitMQ, run:
   > kubectl get secret xld-production-rabbitmq  -o jsonpath="{.data.rabbitmq-password}" | base64 --decode; echo

```

## 6. Do following changes in the xebialabs/dai-deploy/daideploy_cr.yaml, based on the requirement.
### i. To update admin password 
 * Default  deploy admin password is "admin", if we need to update below fields.
```shell
    .spec.AdminPassword: <password from previous installation>
```
### ii. If we are using external database.
```shell
    .spec.UseExistingDB.enabled: true
    .spec.UseExistingDB.XL_DB_PASSWORD: <db password from previous installation>
    .spec.UseExistingDB.XL_DB_URL: <db url from previous installation>
    .spec.UseExistingDB.XL_DB_USERNAME: <db username from previous installation>
```
### iii. To setup haproxy/nginx.
  * To enable haproxy setup   
    ```shell
       .spec.haproxy-ingress.install = true
       .spec.nginx-ingress-controller.install = false
       .spec.ingress.path = "/"
               
       ## in the spec.ingress.annotations replace all nginx. settings and put:
       kubernetes.io/ingress.class: "haproxy"
       ingress.kubernetes.io/ssl-redirect: "false"
       ingress.kubernetes.io/rewrite-target: /
       ingress.kubernetes.io/affinity: cookie
       ingress.kubernetes.io/session-cookie-name: JSESSIONID
       ingress.kubernetes.io/session-cookie-strategy: prefix
       ingress.kubernetes.io/config-backend: |
       option httpchk GET /ha/health HTTP/1.0
    ```
  * To enable nginx controller
    ```shell
       .spec.haproxy-ingress.install = false
       .spec.nginx-ingress-controller.install = true
    ```
  * To enable external nginx or haproxy
    ```shell
     * 1.
       .spec.haproxy-ingress.install = false
       .spec.nginx-ingress-controller.install = false
    
     * 2.  in .spec.ingress.annotations.
       kubernetes.io/ingress.class: "<external ingress class>"
    
     * 3.   
       .spec.ingress.hosts = <external nginxor haproxy hosts>
    ```
### iii. To setup oidc
* By default keycloak will be enabled as default oidc provider.
    * To disable oidc and keycloak.
         ```shell
            .spec.keycloak.install = false
            .spec.oidc.enabled =  false
         ```
    * To disable keycloak and enable external oidc.
         ```shell
            .spec.keycloak.install = false
            .spec.oidc.enabled =  true
            .spec.oidc.external = true
      
            ##  update the below fields with external oidc configuration
            .spec.oidc.accessTokenUri:
            .spec.oidc.clientId:
            .spec.oidc.clientSecret:
            .spec.oidc.emailClaim:
            .spec.oidc.external:
            .spec.oidc.fullNameClaim:
            .spec.oidc.issuer:
            .spec.oidc.keyRetrievalUri:
            .spec.oidc.logoutUri:
            .spec.oidc.postLogoutRedirectUri:
            .spec.oidc.redirectUri:
            .spec.oidc.rolesClaim:
            .spec.oidc.userAuthorizationUri:
            .spec.oidc..userNameClaim:
         ```      
    * To enable keycloak, with default embedded database.
      :::caution
        Known issue: in 22.1.4
          * Issue 1:
              * If the Previous installation using external database for xl-deploy.
              * When we try to upgrade to latest 22.1.4 with keycloak enabled with embedded database, then we will be end using embedded database for both deploy and keycloak.
                 ".spec.UseExistingDB.enabled", has no effects.
          * Issue 2:
              * If the Previous installation using embedded database for xl-deploy.
              * When we try to upgrade to latest 22.1.4 with keycloak enabled with embedded database.
                  * Post upgrade keycloak pod failed to start with below error.
                  Caused by: org.postgresql.util.PSQLException: FATAL: password authentication failed for user "keycloak"
                    * We need to Connect to the pod/dai-xld-postgresql-0 pod and create the keycloak database.
                    * kuebctl exec -it pod/dai-xld-postgresql-0 -- bash
                    * psql -U postgres  
                        note : Postgres password from previous installation
                    * create database keycloak;
                    * create user keycloak with encrypted password 'keycloak';
                    * grant all privileges on database keycloak to keycloak;            
      :::
     
        ```shell
            .spec.keycloak.install = true
            .spec.oidc.enabled =  true
            .spec.oidc.external = false
            .spec.postgresql.install = true
            .spec.postgresql.persistence.storageClass = <storageClass specific to provider>
            .spec.keycloak.ingress.console.rules[0].host = <hosts for keycloak>
			.spec.keycloak.ingress.rules[0].host = <hosts for keycloak>
         ```      
   * To enable keycloak, with external database.
        ```shell
                    .spec.keycloak.install = true
                    .spec.oidc.enabled =  true
                    .spec.oidc.external = false
                    .spec.postgresql.install = true
                    .spec.postgresql.persistence.storageClass = <storageClass specific to provider>
                    .spec.keycloak.ingress.console.rules[0].host = <hosts for keycloak>
                    .spec.keycloak.ingress.rules[0].host = <hosts for keycloak>            
        ```
        
     We need to set the External DB in .spec.keycloak.extraEnv.
    Refer docs for more details : [keycloak-configuration_for_k8s_operator](https://docs.digital.ai/bundle/devops-release-version-v.22.1/page/release/how-to/k8s-operator/keycloak-configuration_for_k8s_operator.html)

### iv. To update the rabbitmq Persistence storageclass.

```shell
   .spec.rabbitmq.persistence.storageClass: <Storage Class to be defined for RabbitMQ>
```

### v. To reuse existing claim for postgres/rabbitmq 
* If the release name is different from "dai-xld" and if we are using embedded database, we need to reuse the existing Claim, for data persistence.
  
  * Update the following field with existing claim.
    
  ```shell
            .spec.postgresql.persistence.existingClaim
            .spec.rabbitmq.persistence.existingClaim --> not required, as we dont save any data.
  ```  
  ```shell
  eg:
      .spec.postgresql.persistence.existingClaim: data-xld-production-postgresql-0
  ```
   
  :::note
   If we are having more than one existing PVC for rabbitmq, we don't use existingClaim for rabbitmq configuration, instead we can follow the other approach mentioned below for PV reuse.
  :::
       
  * Post helm uninstall, we can also edit postgres/rabbitmq PV as follows, to create the new PVC with existing PV.
    * Update the postgres pv with following details.      
      ```shell
                  claimRef:
                    apiVersion: v1
                    kind: PersistentVolumeClaim
                    name: data-dai-xld-postgresql-0
                    namespace: default   
      ```
    * Update the rabbitmq pv with following details if we need to reuse the PV of rabbitmq.
     ```shell
                 claimRef:
                   apiVersion: v1
                   kind: PersistentVolumeClaim
                   name: data-dai-xld-rabbitmq-0
                   namespace: default   
     ```   
    * Remove the following from PV [postgres/rabbitmq] while editing.
      ```shell
                 claimRef:
                  uid:
                  resourceVersion:
      ```

## 7. Bring up the xl-deploy in docker.

```shell
  > docker run -d -e "ADMIN_PASSWORD=admin" -e "ACCEPT_EULA=Y" -p 4516:4516 --name xld xebialabs/xl-deploy:22.1.4
```

## 8. Uninstall helm.
:::caution
Before doing helm uninstall, Clean up deploy work directory:
- [Clean up deploy Work directory](https://docs.xebialabs.com/v.22.1/deploy/concept/the-xl-deploy-work-directory/#clean-up-the-work-directory)
:::
```shell
 > helm uninstall <release name>
```
## 9. Below steps are specific to AWS EKS Cluster, with SSO access.
### 1. Verify if we have clusterRole configured with assumeRole trustPolicy.
* Update the ClusterRole TrustPolicy with AssumeRole.
:::note
 [Refer AWS Documentation - Creating a role to delegate permissions to an IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-user.html)  
:::
```json
 {
            "Effect": "Allow",
            "Principal": {
              "AWS": "<add role or user arn here>"
            },
            "Action": "sts:AssumeRole"
        }
       
```

### 2. Configure IAM users or roles to your Amazon EKS cluster.
* Update aws-auth configmap of Cluster with the RoleArn and RoleName.
:::note
[Refer AWS Documentation - Add IAM users or roles to your Amazon EKS cluster](https://docs.aws.amazon.com/eks/latest/userguide/add-user-role.html)
:::
```yaml
mapRoles:
----
- groups:
  - system:bootstrappers
  - system:nodes
  rolearn: <add role arn>
  username: <add role name>

```

## 10. Run the following command.
```shell
 > xl apply -f xebialabs.yaml
```

## 11. Verify the PVC and PV.
```shell
 > kubectl get pvc
NAME                                                STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS          AGE
data-dai-xld-rabbitmq-0                             Bound    pvc-eabd8a4b-8f40-4419-aed6-00f5dfe71982   8Gi        RWO            aws-efs-provisioner   2m11s
data-dir-dai-xld-digitalai-deploy-cc-server-0       Bound    pvc-59ef0be3-37ea-4f89-b7a5-693c2cb9ede2   500M       RWO            aws-efs-provisioner   2m11s
data-dir-dai-xld-digitalai-deploy-master-0          Bound    pvc-64444985-8e98-406c-984f-1d12449f039f   10Gi       RWO            aws-efs-provisioner   127m
data-dir-dai-xld-digitalai-deploy-worker-0          Bound    pvc-5ad67b27-027c-4636-b2b6-8a1e288c6251   5Gi        RWO            aws-efs-provisioner   65m
data-xld-production-rabbitmq-0                      Bound    pvc-8c0a04a8-7657-4239-9faa-dafac99f4d6e   8Gi        RWO            aws-efs-provisioner   136m
work-dir-xld-production-digitalai-deploy-worker-0   Bound    pvc-12c4da86-3b09-4f87-a842-c1b65cae0136   5Gi        RWO            aws-efs-provisioner   136m


 > kubectl get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS     CLAIM                                                       STORAGECLASS          REASON   AGE
pvc-12c4da86-3b09-4f87-a842-c1b65cae0136   5Gi        RWO            Retain           Bound      default/work-dir-xld-production-digitalai-deploy-worker-0   aws-efs-provisioner            136m
pvc-59ef0be3-37ea-4f89-b7a5-693c2cb9ede2   500M       RWO            Delete           Bound      default/data-dir-dai-xld-digitalai-deploy-cc-server-0       aws-efs-provisioner            2m48s
pvc-5ad67b27-027c-4636-b2b6-8a1e288c6251   5Gi        RWO            Retain           Bound      default/data-dir-dai-xld-digitalai-deploy-worker-0          aws-efs-provisioner            65m
pvc-64444985-8e98-406c-984f-1d12449f039f   10Gi       RWO            Retain           Bound      default/data-dir-dai-xld-digitalai-deploy-master-0          aws-efs-provisioner            128m
pvc-8c0a04a8-7657-4239-9faa-dafac99f4d6e   8Gi        RWO            Retain           Bound      default/data-xld-production-rabbitmq-0                      aws-efs-provisioner            136m
pvc-c7aa5a61-594d-4537-ad2e-dbc18d441b91   10Gi       RWO            Retain           Released   default/xld-production-digitalai-deploy                     aws-efs-provisioner            136m
pvc-eabd8a4b-8f40-4419-aed6-00f5dfe71982   8Gi        RWO            Delete           Bound      default/data-dai-xld-rabbitmq-0                             aws-efs-provisioner            2m48s

```
:::note
Note:
 * We will see new PVC and PV created for rabbitmq, we can delete the old PVC and PV.
    * kubectl delete pvc data-xld-production-rabbitmq-0
    * kubectl delete pv pvc-8c0a04a8-7657-4239-9faa-dafac99f4d6e
 * We can reuse the existing claim for postgres.
 * We are using newly created PVC data-dir-dai-xld-digitalai-deploy-master-0 for xl-deploy master pod.
 * We are using newly created PVC data-dir-dai-xld-digitalai-deploy-worker-0 for xl-deploy worker pod.
:::
    
