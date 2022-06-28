---
sidebar_position: 13
---

# B. How to change namespace in case there is deploy already running in the default namespace - with downtime

## Prerequisites
- The kubectl command-line tool
- Access to a Kubernetes cluster with installed Deploy in the `default` namespace

Tested with:
- Deploy operator 10.3.9 with embedded database.
- xl-deploy 10.3.9 upgraded to 22.2.0-621.1206
- xl-cli 22.2.0-621.1206
- Aws EKS cluster

If you have already setup of the XLD default namespace it is possible to move the deployment to the custom namespace. Here we will use for example 
`nsxld`.

In the example we will use XLD 10.3 that will be upgraded to 22.2.0-621.1206 version with latest 22.2.x operator image xebialabsunsupported/deploy-operator:22.2.0-621.1206 from the 
[https://hub.docker.com/r/xebialabsunsupported/deploy-operator/tags](https://hub.docker.com/r/xebialabsunsupported/deploy-operator/tags) and latest operator 
package from the [nexus](https://nexus.xebialabs.com/nexus/content/repositories/releases/ai/digital/deploy/operator/deploy-operator-aws-eks/22.2.0-621.1206/).

## Steps to setup operator on the custom namespace

With following steps you will setup XLD in the custom namespace, by first stopping the setup in the `default` namespace and after starting it in the custom namespace.

:::caution
Before doing any of the following steps backup everything:
- - [Clean up deploy Work directory](https://docs.xebialabs.com/v.22.1/deploy/concept/the-xl-deploy-work-directory/#clean-up-the-work-directory)
- database data
- any custom configuration that was done for the operator setup
- any volume related to deploy in the default namespace, for example data from the mounted volumes on the master and worker pod:
    - /opt/xebialabs/xl-deploy-server/central-conf/deploy-server.yaml.template
    - /opt/xebialabs/xl-deploy-server/centralConfiguration/deploy-oidc.yaml
    - /opt/xebialabs/xl-deploy-server/work
    - /opt/xebialabs/xl-deploy-server/conf
    - /opt/xebialabs/xl-deploy-server/centralConfiguration
    - /opt/xebialabs/xl-deploy-server/ext
    - /opt/xebialabs/xl-deploy-server/hotfix/lib
    - /opt/xebialabs/xl-deploy-server/hotfix/plugins
    - /opt/xebialabs/xl-deploy-server/hotfix/satellite-lib
    - /opt/xebialabs/xl-deploy-server/log
:::

### B.1. Create custom namespace

Setup custom namespace on Kubernetes cluster, `nsxld` for example:
```
❯ kubectl create namespace nsxld
```

Replace `custom-namespace-1` name in this and following steps with your custom namespace name.

### B.2. Backup everything on cluster

1. Collect all custom changes that are done in the `default` namespace for XLD resources
    - StatefulSets
    - Deployments
    - ConfigMaps
    - Secrets
    - CustomResource
    - anything else that was customized
2. Collect any other change that was done during initial setup according to the
   [https://docs.xebialabs.com/v.22.1/deploy/how-to/k8s-operator/install-deploy-using-k8s-operator/#installing-deploy-on-amazon-eks](https://docs.xebialabs.com/v.22.1/deploy/how-to/k8s-operator/install-deploy-using-k8s-operator/#installing-deploy-on-amazon-eks)
3. If you are using your own database and messaging queue setup, do the data backup.

:::note
Note:
Any data migration is out of scope of this document. For example in case of database data migration, check with your DB admins what to do in that case.
For the external database case the best option is to migrate database to a new database schema, and use that schema on the new namespace.
:::


### B.3. Prepare the deploy operator

1. Get the deploy operator package zip for AWS-EKS: deploy-operator-aws-eks-22.2.0-621.1206.zip (correct operator image is already setup in the package).

2. Download and set up the XL CLI setup (xl cli version in this case 22.2.0-621.1206) from https://nexus.xebialabs.com/nexus/service/local/repositories/releases/content/com/xebialabs/xlclient/xl-client/22.2.0-621.1206/xl-client-22.2.0-621.1206-linux-amd64.bin
   Do the step 6 from the documentation [Step 6—Download and set up the XL CLI](https://docs.xebialabs.com/v.22.1/deploy/how-to/k8s-operator/install-deploy-using-k8s-operator/#step-6download-and-set-up-the-xl-cli)
```shell
[sishwarya@localhost B-defaultns-downtime] $ ./xl-client-22.2.0-621.1206-linux-amd64.bin version
CLI version:             22.2.0-621.1206
Git version:             v22.2.0-620.544-1-g520f8bb
API version XL Deploy:   xl-deploy/v1
API version XL Release:  xl-release/v1
Git commit:              520f8bbd7c61c7d11a16b677838250fa570730a2
Build date:              2022-06-21T11:33:41.580Z
GO version:              go1.16
OS/Arch:                 linux/amd64
```

3. Do the step 7 from the documentation [Step 7—Set up the XL Deploy Container instance](https://docs.xebialabs.com/v.22.1/deploy/how-to/k8s-operator/install-deploy-using-k8s-operator/#step-7set-up-the-xl-deploy-container-instance-1)
Use the 22.2.0-621.1206version of the deploy: `docker run -d -e "ADMIN_PASSWORD=admin" -e "ACCEPT_EULA=Y" -p 4516:4516 --name xld xebialabsunsupported/xl-deploy:22.2.0-621.1206`

4. Run the upgrade setup with a dry run and generate the blueprint file:

Here is sample of the responses:
```
❯ [sishwarya@localhost dryrun] $ ../xl-client-22.2.0-621.1206-linux-amd64.bin op --upgrade --dry-run
? Select the setup mode? advanced
? Select the Kubernetes setup where the digitalai Devops Platform will be installed or uninstalled: AwsEKS [AWS EKS]
? Do you want to use Kubernetes' current-context from ~/.kube/config? Yes
? Do you want to use the AWS SSO credentials ? No
? Do you want to use the AWS credentials from your ~/.aws/credentials file? Yes
? Do you want to use an custom Kubernetes namespace (current default is 'digitalai')? Yes
? Enter the name of the existing Kubernetes namespace where the XebiaLabs DevOps Platform will be installed, updated or undeployed: default
Connecting to EKS
? Product server you want to perform upgrade for daiDeploy [Digital.ai Deploy]
? Enter the repository name(eg: <repositoryName>/<imageName>:<tagName>) xebialabsunsupported
? Enter the deploy server image name(eg: <repositoryName>/<imageName>:<tagName>) xl-deploy
? Enter the image tag(eg: <repositoryName>/<imageName>:<tagName>) 22.2.0-621.1206
? Enter the deploy task engine image name for version 22 and above (eg: <repositoryName>/<imageName>:<tagName>) deploy-task-engine
? Choose the version of the XL Deploy for Upgrader setup of operator 22.2.0-621.1206
? Do you want to enable an oidc? Yes
? Do you want to use an existing external oidc configuration from previous installation? No
? Use embedded keycloak? Yes
? Enter Keycloak public URL deploy.keycloak.digitalai-testing.com
? Use embedded DB for keycloak? Yes
? Select the type of upgrade you want. operatorToOperator [Operator to Operator]
? Operator image to use xebialabsunsupported/deploy-operator:22.2.0-621.1206
? Do you want to use custom operator zip file for Deploy? Yes
? Deploy operator zip to use (absolute path or URL to the zip) /home/sishwarya/SprintTicket/S-84982_ns_xld_migration/B-defaultns-downtime/deploy-operator-aws-eks-22.2.0-621.1206.zip
? Enter the name of custom resource definition. digitalaideploys.xld.digital.ai
? Enter the name of custom resource. dai-xld
? Edit list of custom resource keys that will migrate to the new Deploy CR <Received>
	 -------------------------------- ----------------------------------------------------
	| LABEL                          | VALUE                                              |
	 -------------------------------- ----------------------------------------------------
	| AWSAccessKey                   | *****                                              |
	| AWSAccessSecret                | *****                                              |
	| AWSSessionToken                | *****                                              |
	| CrName                         | dai-xld                                            |
	| CrdName                        | digitalaideploys.xld.digital.ai                    |
	| DeployImageVersionForUpgrader  | 22.2.0-621.1206                                    |
	| EksClusterName                 | devops-operator-cluster-test-cluster               |
	| EnableOidc                     | true                                               |
	| ImageNameDeploy                | xl-deploy                                          |
	| ImageNameDeployTaskEngine      | deploy-task-engine                                 |
	| ImageTag                       | 22.2.0-621.1206                                    |
	| IsAwsCfgAvailable              | true                                               |
	| K8sApiServerURL                | https://72673EC78289B3B122CAC4CA8E6473C2.gr7.us-.. |
	| K8sSetup                       | AwsEKS                                             |
	| KeycloakUrl                    | deploy.keycloak.digitalai-testing.com              |
	| Namespace                      | default                                            |
	| OperatorImageDeployGeneric     | xebialabsunsupported/deploy-operator:22.2.0-621... |
	| OperatorZipDeploy              | /home/sishwarya/SprintTicket/S-84982_ns_xld_migr.. |
	| OsType                         | linux                                              |
	| PreserveCrValuesDeploy         | .metadata.name\n.spec.XldMasterCount\n.spec.XldW.. |
	| RepositoryName                 | xebialabsunsupported                               |
	| ServerType                     | daiDeploy                                          |
	| UpgradeType                    | operatorToOperator                                 |
	| UseAWSSsoCredentials           | false                                              |
	| UseAWSconfig                   | true                                               |
	| UseCustomNamespace             | true                                               |
	| UseEmbeddedKeycloak            | true                                               |
	| UseExistingOidcConf            | false                                              |
	| UseKeycloakWithEmbeddedDB      | true                                               |
	| UseKubeconfig                  | true                                               |
	| UseOperatorZipDeploy           | true                                               |
	 -------------------------------- ----------------------------------------------------
? Do you want to proceed to the deployment with these values? Yes
? Current CRD resource "digitalaideploys.xld.digital.ai" is used in following CRs and namespaces:
Name      Namespace
dai-xld   default

Should CRD be reused. If Yes it will not be deleted, if No we will delete CRD "digitalaideploys.xld.digital.ai", and all related CRs will be deleted with it. Yes
Generated files successfully! 
Update central configuration values...	\ Using same custom resource name dai-xld
Update with keycloak values...	| Generated files successfully operatorToOperator upgrade on AwsEKS 
```

That will create files and directories in the working directory. The main directory is `xebialabs` and inside it are all template files that we need to edit.
Check the `xebialabs/dai-deploy/daideploy_cr.yaml` if all values are correctly set there.

:::note
Note:
Ignore question `Choose the version of the XL Deploy for Upgrader setup of operator`, we are not starting XL Deploy with this step,
because we have it already running in the step B.3.3. 
:::

### B.4. Update the deploy operator package to support custom namespace (common part)

Update following files (relative to the provider's directory) with custom namespace name:

| File name                                                                   | Yaml path                                     | Value to set                                             |
|:----------------------------------------------------------------------------|:----------------------------------------------|:---------------------------------------------------------|
| xebialabs/xl-k8s-foundation.yaml [kind: Infrastructure]                     | spec[0].children[0].children[0].name          | nsxld                                       |
| xebialabs/xl-k8s-foundation.yaml [kind: Infrastructure]                     | spec[0].children[0].children[0].namespaceName | nsxld                                       |
| xebialabs/xl-k8s-foundation.yaml [kind: Environments]                       | spec[0].children[0].members[1]                | - Infrastructure/DIGITALAI/K8s-MASTER/nsxld |
| xebialabs/dai-deploy/template-generic/cluster-role-digital-proxy-role.yaml | metadata.name                                  | nsxld-xld-operator-proxy-role               |
| xebialabs/dai-deploy/template-generic/cluster-role-manager-role.yaml       | metadata.name                                  | nsxld-xld-operator-manager-role             |
| xebialabs/dai-deploy/template-generic/cluster-role-metrics-reader.yaml     | metadata.name                                  | nsxld-xld-operator-metrics-reader           |
| xebialabs/dai-deploy/template-generic/leader-election-rolebinding.yaml     | subjects[0].namespace                          | nsxld                                       |
| xebialabs/dai-deploy/template-generic/manager-rolebinding.yaml             | metadata.name                                  | nsxld-xld-operator-manager-rolebinding      |
| xebialabs/dai-deploy/template-generic/manager-rolebinding.yaml             | roleRef.name                                   | nsxld-xld-operator-manager-role             |
| xebialabs/dai-deploy/template-generic/manager-rolebinding.yaml             | subjects[0].namespace                          | nsxld                                       |
| xebialabs/dai-deploy/template-generic/proxy-rolebinding.yaml               | metadata.name                                  | nsxld-xld-operator-proxy-rolebinding        |
| xebialabs/dai-deploy/template-generic/proxy-rolebinding.yaml               | roleRef.name                                   | nsxld-xld-operator-proxy-role               |
| xebialabs/dai-deploy/template-generic/proxy-rolebinding.yaml               | subjects[0].namespace                          | nsxld                                       |
| xebialabs/dai-deploy/template-generic/postgresql-init-keycloak-db.yaml     | metadata.name                                  | dai-xld-nsxld-postgresql-init-keycloak-db   |
| xebialabs/dai-deploy/template-generic/postgresql-init-keycloak-db.yaml     | spec.template.metadata.name                    | dai-xld-nsxld-postgresql-init-keycloak-db   |
| xebialabs/dai-deploy/template-generic/postgresql-init-keycloak-db.yaml     | spec.template.spec.initContainers[0].env.children[0].value| dai-xld-nsxld-postgresql   |
| xebialabs/dai-deploy/template-generic/postgresql-init-keycloak-db.yaml     | spec.template.spec.containers[0].children[0].env.children[0].value| dai-xld-nsxld-postgresql   |
| xebialabs/dai-deploy/daideploy_cr.yaml                                     | metadata.name                                   | dai-xld-nsxld                               |
| xebialabs/dai-deploy/daideploy_cr.yaml                                     | spec.keycloak.install                           | true                                        |


In the `xebialabs/dai-deploy/template-generic/deployment.yaml` add `env` section after `spec.template.spec.containers[1].image` (in the same level) in case if it is not available:
```yaml
        image: xebialabs...
        env:
          - name: WATCH_NAMESPACE
            valueFrom:
              fieldRef:
                fieldPath: metadata.namespace
        livenessProbe: 
          ...
```

In the `xebialabs/dai-deploy-operator.yaml` delete array element from the `spec[0].children[0].deployables`, where name is `name: custom-resource-definition` if it is not already removed during dry-run.
This will not deploy again CRD, as it already exists, when it was deployed for the first time. Example of the element to delete
```yaml
      - name: custom-resource-definition
        type: k8s.ResourcesFile
        fileEncodings:
          ".+\\.properties": ISO-8859-1
        mergePatchType: strategic
        propagationPolicy: Foreground
        updateMethod: patch
        createOrder: "3"
        modifyOrder: "2"
        destroyOrder: "1"
        file: !file "dai-deploy/template-generic/custom-resource-definition.yaml"
```

### B.4.a. Update the deploy operator package to support custom namespace - only in case of Nginx ingress controller

Following changes are in case of usage nginx ingress (default behaviour):

| File name                                | Yaml path                                                       | Value to set                      |
|:-----------------------------------------|:----------------------------------------------------------------|:----------------------------------|
| xebialabs/dai-deploy/daideploy_cr.yaml | spec.ingress.annotations.kubernetes.io/ingress.class              | nginx-dai-xld-nsxld               |
| xebialabs/dai-deploy/daideploy_cr.yaml | spec.nginx-ingress-controller.extraArgs.ingress-class             | nginx-dai-xld-nsxld               |
| xebialabs/dai-deploy/daideploy_cr.yaml | spec.nginx-ingress-controller.ingressClassResource.name           | nginx-dai-xld-nsxld               |
| xebialabs/dai-deploy/daideploy_cr.yaml | spec.nginx-ingress-controller.ingressClassResource.controllerClass| k8s.io/ingress-nginx-dai-xld-nsxld|
| xebialabs/dai-deploy/daideploy_cr.yaml | spec.keycloak.ingress.annotations.kubernetes.io/ingress.class     | nginx-dai-xld-nsxld               |

### B.4.b. Update the deploy operator package to support custom namespace - only in case of Haproxy ingress controller

:::note
Note:
To setup haproxy instead of default nginx configuration that is provided in the operator package you need to do following changes in the
`xebialabs/dai-deploy/daideploy_cr.yaml`:
- `spec.haproxy-ingress.install = true`
- `spec.nginx-ingress-controller.install = false`
- `spec.ingress.path = "/"`
- in the `spec.ingress.annotations` replace all `nginx.` settings and put:
```
      kubernetes.io/ingress.class: "haproxy"
      ingress.kubernetes.io/ssl-redirect: "false"
      ingress.kubernetes.io/rewrite-target: /
      ingress.kubernetes.io/affinity: cookie
      ingress.kubernetes.io/session-cookie-name: JSESSIONID
      ingress.kubernetes.io/session-cookie-strategy: prefix
      ingress.kubernetes.io/config-backend: |
        option httpchk GET /ha/health HTTP/1.0
```

:::

Following changes are in case of usage haproxy ingress:

| File name                                 | Yaml path                                            | Value to set                       |
|:------------------------------------------|:-----------------------------------------------------|:-----------------------------------|
| xebialabs/dai-deploy/daideploy_cr.yaml  | spec.ingress.annotations.kubernetes.io/ingress.class | haproxy-dai-xld-custom-namespace-1 |
| xebialabs/dai-deploy/daideploy_cr.yaml  | spec.haproxy-ingress.controller.ingressClass         | haproxy-dai-xld-custom-namespace-1 |

### B.5. Update additionally YAML files

Apply all collected changes from the `default` namespace to the CR in the deploy operator package `xebialabs/dai-deploy/daideploy_cr.yaml`.
(The best is to compare new CR `xebialabs/dai-deploy/daideploy_cr.yaml` with the one from the `default` namespace)

Check the YAML files, and update them with additional changes. For example CR YAML and update it with any missing custom configuration. 

If you are using your own database and messaging queue setup, setup it in the same way as in the `default` namespace,
 in the new CR in the deploy operator package `xebialabs/dai-deploy/daideploy_cr.yaml`. 
Database in this case of setup can be reused if there is network visibility in the new namespace where you are moving your installation


In case, During upgrade if we disabled oidc setup by answering below question
- Do you want to enable an oidc? No,
* But you need to add external oidc configuration.
    * For example, you can do now OIDC setup, add the following fields with value under spec tag, for enabling oidc in the `xebialabs/dai-deploy/daideploy_cr.yaml`
```
spec:
  oidc:
    enabled: true
    accessTokenUri: null
    clientId: null
    clientSecret: null
    emailClaim: null
    external: true
    fullNameClaim: null
    issuer: null
    keyRetrievalUri: null
    logoutUri: null
    postLogoutRedirectUri: null
    redirectUri: null
    rolesClaim: null
    userAuthorizationUri: null
    userNameClaim: null
    scopes: ["openid"]
```
Replace nulls with correct values, for more info check [documentation](https://docs.xebialabs.com/v.22.1/deploy/concept/xl-deploy-oidc-authentication/)

### B.6. Be sure to not delete PVs

Do the step from [C.2. Be sure to not delete PVs with you actions](move_pvc_to_other_namespace.md#c2-be-sure-to-not-delete-pvs-with-your-actions)

### B.7. Destroy XLD in default namespace

Do the step from [C.3. Stop everything that is using XLD PVC-s](move_pvc_to_other_namespace.md#c3-stop-everything-that-is-using-xlr-pvc-s-and-other-pvc-if-needed)

### B.8. Move existing PVCs to the custom namespace

There are 3 options from the step from [C.4. Move existing PVC to the custom namespace](move_pvc_to_other_namespace.md#c4-move-existing-pvc-to-the-custom-namespace)

### B.8.1 Do the following changes in master PVCs
* Create the master pod in custom-namespace [eg: nsxld], similar to [C.4.OPTION_1.2 Master - Start following pods](move_pvc_to_other_namespace#c4option_12-master---start-following-pods) 
* Connect to the master pod in custom-namespace.
   ```shell
   ❯ kubectl exec -it dai-xld-master-pv-access-nsxld -n nsxld -- sh
   ``` 
* Update the following file in centralConfiguration folder.
    * deploy-repository.yaml.
      * Point it to correct postgres.  [only required if your using embedded database for deploy]
         - db-url: jdbc:postgresql://dai-xld-nsxld-postgresql:5432/xld-db
          
      ```shell
        ❯ kubectl exec -it pod/dai-xld-master-pv-access-nsxld -n nsxld -- sh
        / # cd opt/xebialabs/xl-deploy-server/centralConfiguration
          /opt/xebialabs/xl-deploy-server/centralConfiguration # cat deploy-repository.yaml
        xl:
          repository:
            artifacts:
              type: db
            database:
              db-driver-classname: org.postgresql.Driver
              db-password: '{cipher}e1d833b5765a924944a6b5e91a089f8fd86dd29a7c9c5d35a8e73f5a968da3f1'
              db-url: jdbc:postgresql://dai-xld-nsxld-postgresql:5432/xld-db
              db-username: xld
      ```
    * deploy-task.yaml.
      * Point it to correct rabbitmq.  [only required if your using embedded rabbitmq for deploy]
          - jms-url: amqp://dai-xld-nsxld-rabbitmq.nsxld.svc.cluster.local:5672/%2F
          
          ```shell
        ❯ kubectl exec -it pod/dai-xld-master-pv-access-nsxld -n nsxld -- sh
        / # cd opt/xebialabs/xl-deploy-server/centralConfiguration
          /opt/xebialabs/xl-deploy-server/centralConfiguration # cat deploy-task.yaml
          akka:
            io:
              dns:
                resolver: async-dns
          deploy:
            task:
              in-process-worker: false
              queue:
                archive-queue-name: xld-archive-queue
                external:
                  jms-driver-classname: com.rabbitmq.jms.admin.RMQConnectionFactory
                  jms-password: '{cipher}9880501a40e7618fa9bb582d84e4b0e296e9f92a43deaaa4ad63bb98ab69c5b3'
                  jms-url: amqp://dai-xld-nsxld-rabbitmq.nsxld.svc.cluster.local:5672/%2F
                  jms-username: guest
                in-process:
                  maxDiskUsage: 100
                  shutdownTimeout: 60000
                name: xld-tasks-queue
          ```
    * deploy-server.yaml
      * If keycloak is enabled. 
        - Update the property deploy.server.security.auth.provider: oidc, if required change the hostname as well.     
        ```shell
        ❯ kubectl exec -it pod/dai-xld-master-pv-access-nsxld -n nsxld -- sh
        / # cd opt/xebialabs/xl-deploy-server/centralConfiguration
        /opt/xebialabs/xl-deploy-server/centralConfiguration # cat deploy-server.yaml 
        deploy.server:
          hostname: dai-xld-nsxld-digitalai-deploy-master-0.dai-xld-nsxld-digitalai-deploy-master.nsxld.svc.cluster.local
          license:
            daysBeforeWarning: 10
          security:
            auth:
              provider: "oidc"
        ```
* Update the following file in conf folder.
        * xld-wrapper.conf.common
            * Search for jmx_prometheus_javaagent.jar and update it to "jmx_prometheus_javaagent-0.16.1.jar".
          Note : Either update the value or delete the file [xld-wrapper.conf.common], it will be downloaded automatically with the latest changes during startup.
  ```shell
  ❯ kubectl exec -it pod/dai-xld-master-pv-access-nsxld -n nsxld -- sh
  / # cd opt/xebialabs/xl-deploy-server/conf
  /opt/xebialabs/xl-deploy-server/conf # rm -rf xld-wrapper.conf.common
    ```
### B.8.2 Do the following changes in worker PVCs
* Create the worker pod in custom-namespace [eg: nsxld].
* Connect to the worker pod
* Update the following file in conf folder.
  * xld-wrapper.conf.common
  * Search for jmx_prometheus_javaagent.jar and update it to "jmx_prometheus_javaagent-0.16.1.jar".
  Note : Either update or delete the file [xld-wrapper.conf.common], it will be downloaded automatically with the latest changes during startup.
    ```shell
        ❯ kubectl exec -it pod/dai-xld-worker-pv-access-nsxld -n nsxld -- sh
        / # cd /opt/xebialabs/deploy-task-engine/conf/
        /opt/xebialabs/deploy-task-engine/conf # rm -rf xld-wrapper.conf.common
        /opt/xebialabs/deploy-task-engine/conf #
    ```
    
### B.9. Deploy to the custom namespace

1. We are using here yaml that was result of the upgrade dry-run in the working directory, so we should apply against following file:
```
xl apply -f ./xebialabs.yaml
```

2. Do the step 9, 10 and 11 from the documentation [Step 9—Verify the deployment status](https://docs.xebialabs.com/v.22.1/deploy/how-to/k8s-operator/install-deploy-using-k8s-operator/#step-10verify-if-the-deployment-was-successful-1)

3. Troubleshooting
   * If cc pod is not initialized, due to below error.
```shell
Type     Reason            Age                 From                    Message
  ----     ------            ----                ----                    -------
Normal   SuccessfulCreate  55s                 statefulset-controller  create Claim data-dir-dai-xld-nsxld-digitalai-deploy-cc-server-0 Pod dai-xld-nsxld-digitalai-deploy-cc-server-0 in StatefulSet dai-xld-nsxld-digitalai-deploy-cc-server success
Warning  FailedCreate      34s (x13 over 55s)  statefulset-controller  create Pod dai-xld-nsxld-digitalai-deploy-cc-server-0 in StatefulSet dai-xld-nsxld-digitalai-deploy-cc-server failed error: Pod "dai-xld-nsxld-digitalai-deploy-cc-server-0" is invalid: spec.initContainers[0].volumeMounts[0].name: Not found: "source-dir"

```
   * Workaround
      - Edit the statefulset of dai-xld-nsxld-digitalai-deploy-cc-server
     ```shell
      ❯ kubectl edit statefulset.apps/dai-xld-nsxld-digitalai-deploy-cc-server
     ```
      - Update the Volume section as below.
     ```yaml
         volumes:      
          - name: source-dir
            persistentVolumeClaim:
              claimName: data-dir-dai-xld-nsxld-digitalai-deploy-master-0
      ```
### B.10. Apply any custom changes

If you have any custom changes that you collected previously in the step 3.3, you can apply them again in this step in the same way as before on the `default` namespace.

Check if PVCs and PVs are reused by the new setup in the custom namespace.

### B.11. Wrap-up

Wait for all pods to ready and without any errors.

If you used same host in the new custom namespace to the one that is on the `default` namespace, in that case XLD page is still opening from the `default` 
namespace. You need in that case apply step 9.a, after that on the configurated host will be available XLD that is from the new custom namespace.

List of pods should look like following table, if nginx and keycloak is enabled.:
```shell

│ NAMESPACE↑           NAME                                                          READY     RESTARTS STATUS  │
nsxld         dai-xld-nsxld-digitalai-deploy-cc-server-0                        1/1     Running     0          65m|
nsxld         dai-xld-nsxld-digitalai-deploy-master-0                           1/1     Running     0          14m|
nsxld         dai-xld-nsxld-digitalai-deploy-worker-0                           1/1     Running     0          15m|
nsxld         dai-xld-nsxld-keyclo-0                                            1/1     Running     0          67m|
nsxld         dai-xld-nsxld-nginx-ingress-controller-dbb495ccc-n4x9r            1/1     Running     0          67m|
nsxld         dai-xld-nsxld-nginx-ingress-controller-default-backend-54cqthz8   1/1     Running     0          67m|
nsxld         dai-xld-nsxld-postgresql-0                                        1/1     Running     0          67m|
nsxld         dai-xld-nsxld-postgresql-init-keycloak-db-mmvr5                   0/1     Completed   0          68m|
nsxld         dai-xld-nsxld-rabbitmq-0                                          1/1     Running     0          67m|
nsxld         xld-operator-controller-manager-759cb85546-g9489                  2/2     Running     0          68m|
    
```
Table could have different entries if you haproxy or using external postgresql and rabbitmq.

#### B.12 Destroy remains of XLD in default namespace

If you are sure that everything is up and running on the new custom namespace, you can destroy remaining setup in the `default` namespace:

```shell
# be careful if you would like really to delete all PVC-s and related PV-s, backup before delete
# get pvcs related to XLR on default namespace and delete them (list of the pvcs depends on what is enabled in the deployment)
❯ kubectl get pvc -n default
❯ kubectl delete -n default pvc data-dai-xld-rabbitmq-0 ...
```

You can also clean up any configmaps or secrets that are in the `default` namespace and related to the XLD.

You also delete all PVs that were connected to the XLD installation in the default namespace, and are not migrated and used by the custom namespace.
