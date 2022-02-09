---
sidebar_position: 6
---

# Updating configuration files on Deploy

## Example how to update deployit.conf for Deploy master and worker

Get current deployit.conf file from the master node:
```shell
❯ kubectl cp dai-xld-digitalai-deploy-master-0:/opt/xebialabs/xl-deploy-server/conf/deployit.conf ./deployit.conf
```

Create following template file to append to it the retrieved `./deployit.conf`:
```shell
❯ echo 'apiVersion: v1
kind: ConfigMap
metadata:
  name: deployit-conf
  labels:
    app: digitalai-deploy
data:
  deployit.conf: |
  ' > config-patch-deployit.yaml.template
```

Merge the files:
```shell
❯ cat config-patch-deployit.yaml.template > config-patch-deployit.yaml
❯ sed -e 's/^/     /' deployit.conf >> config-patch-deployit.yaml
```

Change the config in the `config-patch-deployit.yaml`.

Create the config map with `config-patch-deployit.yaml`:
```shell
❯ kubectl create -f config-patch-deployit.yaml
```

Get all statefulsets (master statefulset will be suffixed with `-master`):
```shell
❯ kubectl get sts -o name
```

Change the statefulset for the master server by adding volume mounts and volumes:
```shell
❯ kubectl get statefulset.apps/dai-xld-digitalai-deploy-master -o yaml \
    | yq eval '.spec.template.spec.containers[0].volumeMounts += {
        "mountPath": "/opt/xebialabs/xl-deploy-server/conf/deployit.conf",
        "name": "deployit-conf-volume",
        "subPath": "deployit.conf"
      }' - \
    | yq eval '.spec.template.spec.volumes += [{
        "name": "deployit-conf-volume",
        "configMap": {
          "name": "deployit-conf"
        }
      }]' - \
    | kubectl replace -f -
```

Restart Deploy masters:
```shell
❯ kubectl delete pod dai-xld-digitalai-deploy-master-0
```

:::note
Latest Deploy workers does not have `conf/deployit.conf` files, so it is not needed to do following step, all versions below 10.3 require it.
:::

Change the statefulset for the master worker by adding volume mounts and volumes:
```shell
❯ kubectl get statefulset.apps/dai-xld-digitalai-deploy-worker -o yaml \
    | yq eval '.spec.template.spec.containers[0].volumeMounts += {
        "mountPath": "/opt/xebialabs/xl-deploy-server/conf",
        "name": "deployit-conf-template-volume",
        "subPath": "deployit.conf"
      }' - \
    | yq eval '.spec.template.spec.volumes += [{
        "name": "deployit-conf-template-volume",
        "configMap": {
          "name": "deployit-conf-template"
        }
      }]' - \
    | kubectl replace -f -
```

Restart Deploy workers:
```shell
❯ kubectl get pod
❯ kubectl delete pod dai-xld-digitalai-deploy-master-0
```

## Update configuration file generic example for Deploy

You can use following way to update any configuration file on the Deploy in the `centralConfiguration` or in the `conf` directory.

:::note
The files in `centralConfiguration` need to be updated on all master nodes. The files are not needed on worker nodes.
The files in `conf` need to be updated on all master and worker nodes (if they exist on the worker node for the specific version).
:::

Get info to list deploy master and worker pod names and statefulsets:
```shell
kubectl get pod -o name
kubectl get sts -o name
```

Setup environment vals:
- change `CONFIG_FILE` variable and `PATH_TO_CONFIG_FILE` to :
```shell
export PRODUCT=deploy
export POD_NAME=dai-xld-digitalai-deploy-master-0
export CONFIG_FILE=deployit.conf
export CONFIG_FILE_DASH=${CONFIG_FILE//./-}
export PATH_TO_CONFIG_FILE=/opt/xebialabs/xl-$PRODUCT-server/default/$CONFIG_FILE
export STATEFUL_SET_NAME=statefulset.apps/dai-xld-digitalai-deploy-master
```

Run set of commands:
```shell
kubectl cp $POD_NAME:$PATH_TO_CONFIG_FILE ./$CONFIG_FILE

echo "apiVersion: v1
kind: ConfigMap
metadata:
  name: $CONFIG_FILE_DASH-config-map
  labels:
    app: digitalai-$PRODUCT
data:
  $CONFIG_FILE: |" > config-patch-${CONFIG_FILE}.yaml.template
  
cat config-patch-${CONFIG_FILE}.yaml.template > config-patch-${CONFIG_FILE}.yaml
sed -e 's/^/     /' $CONFIG_FILE >> config-patch-${CONFIG_FILE}.yaml
```

Edit the YAML file and add your custom changes to it: `config-patch-${CONFIG_FILE}.yaml`

Create config map on cluster and use it:
```shell
kubectl create -f config-patch-${CONFIG_FILE}.yaml
kubectl get $STATEFUL_SET_NAME -o yaml \
    | yq eval ".spec.template.spec.containers[0].volumeMounts += {
        \"mountPath\": \"$PATH_TO_CONFIG_FILE\",
        \"name\": \"$CONFIG_FILE_DASH-volume\",
        \"subPath\": \"$CONFIG_FILE\"
      }" - \
    | yq eval ".spec.template.spec.volumes += [{
        \"name\": \"$CONFIG_FILE_DASH-volume\",
        \"configMap\": {
          \"name\": \"$CONFIG_FILE_DASH-config-map\"
        }
      }]" - \
    | kubectl replace -f -
kubectl delete pod $POD_NAME
```

## Upgrade process if you have updated files with config maps

To preserve configuration changes after upgrades, you will need to build custom images of the operator with all custom changes in
the statefulsets:
1. Checkout correct branch for the Deploy helm chart with the target version branch of the operator from here: [xl-deploy-kubernetes-helm-chart](https://github.com/xebialabs/xl-deploy-kubernetes-helm-chart)
2. Build the operator with the provided script in the root of the repository: `./build_operator.sh`
3. Release the operator to the image repository according to the script's guide
4. Use the newly created image as the answer during `xl op --upgrade` execution:
   - `Operator image to use (OperatorImageDeploy)`
5. After the upgrade, if the upgrade changes the configuration files, transfer the changes to the config-map so the changes could be preserved. 

## Update configuration file for RabbitMQ

To change configuration of the RabbitMQ use available parameters on the
[RabbitMQ packaged by Bitnami](https://github.com/bitnami/charts/tree/master/bitnami/rabbitmq#parameters)

## Update configuration file for PostgreSql

To change configuration of the PostgreSql use available parameters on the
[PostgreSQL packaged by Bitnami](https://github.com/bitnami/charts/tree/master/bitnami/postgresql#parameters)

## Upgrade process if you have updated the CR values

To preserve changed values in the CR use the following:
1. Download operator zip version from the [deploy operator zip](https://dist.xebialabs.com/customer/operator/deploy/)
   with specific provider and version that you will install
2. Run `xl op --upgrade` with answers:
```
Do you want to use a custom operator zip file for Deploy? (UseOperatorZipDeploy): Yes
Deploy operator zip to use (absolute path or URL to the zip) (OperatorZipDeploy): [Path to the zip file that you downloaded]
Edit list of custom resource keys that will migrate to the new Deploy CR (PreserveCrValuesDeploy): [Check comment below]
```
Add all paths where you updated CR values from the original value.
