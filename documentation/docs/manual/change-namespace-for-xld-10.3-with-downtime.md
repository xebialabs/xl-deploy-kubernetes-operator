---
sidebar_position: 13
---

# B. How to change namespace in case there is deploy already running in the default namespace - with downtime

## Prerequisites
- The kubectl command-line tool
- Access to a Kubernetes cluster with installed Deploy in the `default` namespace

Tested with:
- xl-deploy 22.1.4
- xl-deploy 10.3.9 upgraded to 22.2.0-621.1206
- xl-cli 22.2.0-621.1206
- Aws EKS cluster

If you have already setup of the XLD default namespace it is possible to move the deployment to the custom namespace. Here we will use for example 
`custom-namespace-1`.

In the example we will use XLD 10.3 that will be upgraded to 22.2.0-621.1206 version with latest 22.2.x operator image xebialabsunsupported/deploy-operator:22.2.0-621.1206 from the 
[https://hub.docker.com/r/xebialabsunsupported/deploy-operator/tags](https://hub.docker.com/r/xebialabsunsupported/deploy-operator/tags) and latest operator 
package from the [nexus](https://nexus.xebialabs.com/nexus/content/repositories/releases/ai/digital/deploy/operator/deploy-operator-aws-eks/22.2.0-621.1206/).

## Steps to setup operator on the custom namespace

With following steps you will setup XLD in the custom namespace, by first stopping the setup in the `default` namespace and after starting it in the custom namespace.

:::caution
Before doing any of the following steps backup everything:
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

Replace `nsxld` name in this and following steps with your custom namespace name.

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

# HAPROXY yet to verify start $$$$$$$$$$$$$$$$$$
### B.4.b. Update the release operator package to support custom namespace - only in case of Haproxy ingress controller

:::note
Note:
To setup haproxy instead of default nginx configuration that is provided in the operator package you need to do following changes in the
`xebialabs/dai-release/dairelease_cr.yaml`:
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
| xebialabs/dai-release/dairelease_cr.yaml  | spec.ingress.annotations.kubernetes.io/ingress.class | haproxy-dai-xlr-custom-namespace-1 |
| xebialabs/dai-release/dairelease_cr.yaml  | spec.haproxy-ingress.controller.ingressClass         | haproxy-dai-xlr-custom-namespace-1 |

# HAPROXY yet to verify end $$$$$$$$$$$$$$$$$$

### B.5. Update additionally YAML files

Apply all collected changes from the `default` namespace to the CR in the release operator package `xebialabs/dai-deploy/daideploy_cr.yaml`.
(The best is to compare new CR `xebialabs/dai-deploy/daideploy_cr.yaml` with the one from the `default` namespace)

Check the YAML files, and update them with additional changes. For example CR YAML and update it with any missing custom configuration. 

If you are using your own database and messaging queue setup, setup it in the same way as in the `default` namespace,
 in the new CR in the deploy operator package `xebialabs/dai-deploy/daideploy_cr.yaml`. 
Database in this case of setup can be reused if there is network visibility in the new namespace where you are moving your installation


For example you can do now OIDC setup, add the following fields with value under spec tag, for enabling oidc in the `xebialabs/dai-deploy/daideploy_cr.yaml`
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

### B.9. Deploy to the custom namespace

1. We are using here yaml that was result of the upgrade dry-run in the working directory, so we should apply against following file:
```
xl apply -f ./xebialabs.yaml
```

2. Do the step 9, 10 and 11 from the documentation [Step 9—Verify the deployment status](https://docs.xebialabs.com/v.22.1/deploy/how-to/k8s-operator/install-deploy-using-k8s-operator/#step-10verify-if-the-deployment-was-successful-1)


### B.10. Apply any custom changes

If you have any custom changes that you collected previously in the step 3.3, you can apply them again in this step in the same way as before on the `default` namespace.

Check if PVCs and PVs are reused by the new setup in the custom namespace.

### B.11. Wrap-up

Wait for all pods to ready and without any errors. 

If you used same host in the new custom namespace to the one that is on the `default` namespace, in that case XLR page is still opening from the `default` 
namespace. You need in that case apply step 9.a, after that on the configurated host will be available XLR that is from the new custom namespace.

In case of haproxy and one release pod, list of pods should look like following table:
```
│ NAMESPACE↑           NAME                                                          READY     RESTARTS STATUS  │
│ custom-namespace-1   custom-namespace-1-dai-xlr-haproxy-ingress-7df948c7d7-7xcrt   1/1              0 Running │
│ custom-namespace-1   dai-xlr-digitalai-release-0                                   1/1              0 Running │
│ custom-namespace-1   dai-xlr-postgresql-0                                          1/1              0 Running │
│ custom-namespace-1   dai-xlr-rabbitmq-0                                            1/1              0 Running │
│ custom-namespace-1   xlr-operator-controller-manager-78ff46dbb8-rq45l              2/2              0 Running │    
```
Table could have different entries if you nginx or using external postgresql and rabbitmq.

#### B.12 Destroy remains of XLR in default namespace

If you are sure that everything is up and running on the new custom namespace, you can destroy remaining setup in the `default` namespace:

```shell
# be careful if you would like really to delete all PVC-s and related PV-s, backup before delete
# get pvcs related to XLR on default namespace and delete them (list of the pvcs depends on what is enabled in the deployment)
❯ kubectl get pvc -n default
❯ kubectl delete -n default pvc data-dai-xlr-rabbitmq-0 ...
```

You can also clean up any configmaps or secrets that are in the `default` namespace and related to the XLR.

You also delete all PVs that were connected to the XLR installation in the default namespace, and are not migrated and used by the custom namespace.
