---
sidebar_position: 14
---

# How to change namespace of the PVC

:::caution
This is internal documentation. This document can be used only if it was recommended by the Support Team.
:::

:::caution
This setup is deprecated from the 22.3 version.
:::

# C. How to change namespace of the PVC

## Prerequisites
- The kubectl command-line tool
- Access to a Kubernetes cluster with installed Deploy in the `default` namespace

Tested with:
- xl-deploy 10.3.9
- xl-cli 22.1.4
- AWS EKS cluster


## C.1. Backup everything

:::caution
Before doing any of the following steps backup everything:
- database data
- any custom configuration that was done for the operator setup
  - StatefulSets
  - Deployments
  - ConfigMaps
  - Secrets
  - CustomResource
  - anything else that was customized
- any volume related to deploy master in the default namespace, for example data from the mounted volumes on the deploy master pod:
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
- any volume related to deploy worker in the default namespace, for example data from the mounted volumes on the deploy worker pod:
  - /opt/xebialabs/xl-deploy-server/work
  - /opt/xebialabs/xl-deploy-server/conf
  - /opt/xebialabs/xl-deploy-server/centralConfiguration
  - /opt/xebialabs/xl-deploy-server/ext
  - /opt/xebialabs/xl-deploy-server/hotfix/lib
  - /opt/xebialabs/xl-deploy-server/hotfix/plugins
  - /opt/xebialabs/xl-deploy-server/hotfix/satellite-lib
  - /opt/xebialabs/xl-deploy-server/log
:::


## C.2. Be sure to not delete PVs with your actions

Patch the all PVs to set the “persistentVolumeReclaimPolicy” to “Retain”, for example (if cluster admin's didn't do that already):

```
❯ kubectl get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                                                STORAGECLASS          REASON   AGE
pvc-4fa67d64-8763-464f-890b-0ba4124a780c   8Gi        RWO            Delete           Bound    default/data-dai-xld-rabbitmq-0                      aws-efs-provisioner            29m
pvc-5b6a8575-3017-43c1-92ab-41ee1e0fd3b1   10Gi       RWO            Delete           Bound    default/data-dir-dai-xld-digitalai-deploy-worker-0   aws-efs-provisioner            29m
pvc-8055342d-51e2-4d3d-8066-f2efcb16f658   10Gi       RWO            Delete           Bound    default/data-dir-dai-xld-digitalai-deploy-master-0   aws-efs-provisioner            29m
pvc-fe787f3c-3036-49fe-a0d9-6f09db5510f2   50Gi       RWO            Delete           Bound    default/data-dai-xld-postgresql-0                    aws-efs-provisioner            29m
...

❯ kubectl patch pv pvc-8055342d-51e2-4d3d-8066-f2efcb16f658 -p '{"spec":{"persistentVolumeReclaimPolicy":"Retain"}}'
persistentvolume/pvc-53564205-6e1e-45f0-9dcf-e21adefa6eaf patched
```

Export the current PVCs objects because it will be necessary to recreate the PVCs in a later stage:
```
❯ kubectl get pvc data-dir-dai-xld-digitalai-deploy-master-0 -n default -o yaml > pvc-data-dir-dai-xld-digitalai-deploy-master-0.yaml

❯ kubectl get pvc data-dir-dai-xld-digitalai-deploy-worker-0 -n default -o yaml > pvc-data-dir-dai-xld-digitalai-deploy-worker-0.yaml

❯ kubectl get pvc data-dai-xld-postgresql-0 -n default -o yaml > pvc-data-dai-xld-postgresql-0.yaml
```

Iterate on all PVs that are connected to the XLD PVCs in the default namespace, list depends on the installed components. 
For example, here is list of PVCs that are usually in the default namespace:
- data-dir-dai-xld-digitalai-deploy-master-0
- data-dir-dai-xld-digitalai-deploy-worker-0  
- data-dai-xld-postgresql-0
- data-dai-xld-rabbitmq-0

On the end check if all PVs have correct Reclaim Policy:

```
❯ kubectl get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                                                STORAGECLASS          REASON   AGE
pvc-4fa67d64-8763-464f-890b-0ba4124a780c   8Gi        RWO            Retain           Bound    default/data-dai-xld-rabbitmq-0                      aws-efs-provisioner            32m
pvc-5b6a8575-3017-43c1-92ab-41ee1e0fd3b1   10Gi       RWO            Retain           Bound    default/data-dir-dai-xld-digitalai-deploy-worker-0   aws-efs-provisioner            32m
pvc-8055342d-51e2-4d3d-8066-f2efcb16f658   10Gi       RWO            Retain           Bound    default/data-dir-dai-xld-digitalai-deploy-master-0   aws-efs-provisioner            32m
pvc-fe787f3c-3036-49fe-a0d9-6f09db5510f2   50Gi       RWO            Retain           Bound    default/data-dai-xld-postgresql-0                    aws-efs-provisioner            32m
```


## C.3. Stop everything that is using XLD PVC-s (and other PVC if needed)

:::caution
Be sure that you did backup of the CR before this step!
:::

If you are sure that everything is backuped and ready for installation on the new custom namespace, you can destroy previous setup on the `default` namespace,
here are steps how to do that:

```shell
# get the CR on default namespace and delete it
❯ kubectl get digitalaideploys.xld.digital.ai -n default -o yaml > cr-dai-xld-default.yaml
❯ kubectl delete -n default -f cr-dai-xld-default.yaml

# get the deployment on default namespace and delete it
❯ kubectl get deployment -n default
❯ kubectl delete -n default deployment xld-operator-controller-manager

# get the service on default namespace and delete it
❯ kubectl get service -n default
❯ kubectl delete -n default service xld-operator-controller-manager-metrics-service

# get the role on default namespace and delete it
❯ kubectl get roles -n default
❯ kubectl delete -n default roles xld-operator-leader-election-role

# get the roleBinding on default namespace and delete it
❯ kubectl get roleBinding -n default
❯ kubectl delete -n default roleBinding xld-operator-leader-election-rolebinding

# get clusterRoles related to XLD on default namespace and delete them
❯ kubectl get clusterRoles
❯ kubectl delete clusterRoles xld-operator-manager-role xld-operator-metrics-reader xld-operator-proxy-role

# get clusterRoleBinding related to XLD on default namespace and delete them
❯ kubectl get clusterRoleBinding
❯ kubectl delete clusterRoleBinding xld-operator-proxy-rolebinding xld-operator-manager-rolebinding
```

Do not delete PVs or PVCs we can reuse them on the new namespace.


## C.4. Move existing PVC to the custom namespace

Select one option that the best suites for your case.

Iterate one of the selected options on all PVs and PVCs that are connected to the XLD PVCs in the default namespace, list depends on the installed components.
For example, here is list of PVCs that are usually in the default namespace:
- data-dir-dai-xld-digitalai-deploy-master-0 - recommended is option C.4.OPTION_1
- data-dir-dai-xld-digitalai-deploy-worker-0 - recommended is option C.4.OPTION_1
- data-dai-xld-postgresql-0 - if embedded DB is used the best is to use C.4.OPTION_2
- data-dai-xld-rabbitmq-0 - if embedded rabbitmq is used you can skip rabbitmq PVC migration, rabbitmq in the new namespace will use new PVC and PV in that case. 

### C.4.OPTION_1 Create PVC in the custom namespace by copying PV data

#### C.4.OPTION_1.1 Make the copy of the `pvc-data-dir-dai-xld-digitalai-deploy-master-0.yaml` for the later reference, to the `pvc-data-dir-dai-xld-digitalai-deploy-master-0-nsxld.yaml`. 
* Edit file `pvc-data-dir-dai-xld-digitalai-deploy-master-0-nsxld.yaml`:
    1. Delete all the lines under sections:
    - `status`
    - `spec.volumneMode`
    - `spec.volumneName`
    - `metadata.uid`
    - `metadata.resourceVersion`
    - `metadata.namespace`
    - `metadata.creationTimestamp`
    - `metadata.finalizers`
    - `metadata.annotations.pv.kubernetes.io/bind-completed`
    - `metadata.annotations.pv.kubernetes.io/bound-by-controller`

    2. Rename following lines by adding namespace name:
    - `metadata.name` from data-dir-dai-xld-digitalai-deploy-master-0 to data-dir-dai-xld-nsxld-digitalai-deploy-master-0
    - `metadata.labels.release` from dai-xld to dai-xld-nsxld
    - `metadata.annotations.meta.helm.sh/release-namespace` from default to nsxld
    - `metadata.annotations.meta.helm.sh/release-name` from dai-xld to dai-xld-nsxld
      The renaming rule is to replace any occurrence of `dai-xld` with `dai-xld-{{custom_namespace_name}}`

* Create those PVCs, but inside the Namespace “nsxld”:
  ```shell
  ❯ kubectl apply -f pvc-data-dir-dai-xld-digitalai-deploy-master-0-nsxld.yaml -n nsxld
  persistentvolumeclaim/dai-xld-nsxld-digitalai-deploy-master-0 created
  ❯ kubectl apply -f pvc-data-dir-dai-xld-digitalai-deploy-worker-0-nsxld.yaml -n nsxld
  persistentvolumeclaim/dai-xld-nsxld-digitalai-deploy-worker-0 created
  ```
* Check if PVC is bound
   Check the PVCs state, which will probably in Pending state, and after some time in Bound state:
  ```shell
  ❯ kubectl get pvc -n nsxld
  NAME                                      STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS          AGE
  dai-xld-nsxld-digitalai-deploy-master-0   Bound    pvc-fba6fe7c-143e-4af8-b974-0e5ec06b3ea8   10Gi       RWO            aws-efs-provisioner   3m54s
  dai-xld-nsxld-digitalai-deploy-worker-0   Bound    pvc-88fc1c15-dfab-4495-80df-9baed3af22de   10Gi       RWO            aws-efs-provisioner   28s
  ```

#### C.4.OPTION_1.2 
  ##### C.4.OPTION_1.2 Master - Start following pods
  * 1. Put following in file `pod-dai-xld-master-pv-access-nsxld.yaml` (don't forget to update nsxld with real namespace name):
        ```yaml
        apiVersion: v1
        kind: Pod
        metadata:
          name: dai-xld-master-pv-access-nsxld
        spec:
          containers:
            - name: sleeper
              command: ["sleep", "1d"]
              image: xebialabs/tiny-tools:22.2.0
              imagePullPolicy: Always
              volumeMounts:
                - name: data-dir
                  mountPath: /opt/xebialabs/xl-deploy-server/work
                  subPath: work
                - name: data-dir
                  mountPath: /opt/xebialabs/xl-deploy-server/conf
                  subPath: conf
                - name: data-dir
                  mountPath: /opt/xebialabs/xl-deploy-server/centralConfiguration
                  subPath: centralConfiguration
                - name: data-dir
                  mountPath: /opt/xebialabs/xl-deploy-server/ext
                  subPath: ext
                - name: data-dir
                  mountPath: /opt/xebialabs/xl-deploy-server/hotfix/lib
                  subPath: lib
                - name: data-dir
                  mountPath: /opt/xebialabs/xl-deploy-server/hotfix/plugins
                  subPath: plugins
                - name: data-dir
                  mountPath: /opt/xebialabs/xl-deploy-server/hotfix/satellite-lib
                  subPath: satellite-lib
                - name: data-dir
                  mountPath: /opt/xebialabs/xl-deploy-server/log
                  subPath: log
          restartPolicy: Never
          volumes:
            - name: reports-dir
              persistentVolumeClaim:
                claimName: data-dir-dai-xld-nsxld-digitalai-deploy-master-0
        ```
  Update the claimName with correct name!
  
  * 2. Start the pod
      ```shell
      ❯ kubectl apply -f pod-dai-xld-master-pv-access-nsxld.yaml -n nsxld
      ```
  
  * 3. Put following in file `pod-dai-xld-master-pv-access-default.yaml` for the default namespace:
    ```yaml
    apiVersion: v1
    kind: Pod
    metadata:
      name: dai-xld-master-pv-access-default
    spec:
      containers:
        - name: sleeper
          command: ["sleep", "1d"]
          image: xebialabs/tiny-tools:22.2.0
          imagePullPolicy: Always
          volumeMounts:
            - name: data-dir
              mountPath: /opt/xebialabs/xl-deploy-server/work
              subPath: work
            - name: data-dir
              mountPath: /opt/xebialabs/xl-deploy-server/conf
              subPath: conf
            - name: data-dir
              mountPath: /opt/xebialabs/xl-deploy-server/centralConfiguration
              subPath: centralConfiguration
            - name: data-dir
              mountPath: /opt/xebialabs/xl-deploy-server/ext
              subPath: ext
            - name: data-dir
              mountPath: /opt/xebialabs/xl-deploy-server/hotfix/lib
              subPath: lib
            - name: data-dir
              mountPath: /opt/xebialabs/xl-deploy-server/hotfix/plugins
              subPath: plugins
            - name: data-dir
              mountPath: /opt/xebialabs/xl-deploy-server/hotfix/satellite-lib
              subPath: satellite-lib
            - name: data-dir
              mountPath: /opt/xebialabs/xl-deploy-server/log
              subPath: log
      restartPolicy: Never
      volumes:
        - name: data-dir
          persistentVolumeClaim:
            claimName: data-dir-dai-xld-digitalai-deploy-master-0
    ```
  
  * 4. Start the pod
    ```shell
    ❯ kubectl apply -f pod-dai-xld-master-pv-access-default.yaml -n default
    ```
  
  * 5. Copy data from one pod to 
    ```shell
    ❯ kubectl exec -n default dai-xld-master-pv-access-default -- tar cf - \
        /opt/xebialabs/xl-deploy-server/centralConfiguration \
        /opt/xebialabs/xl-deploy-server/conf \
        /opt/xebialabs/xl-deploy-server/ext \
        /opt/xebialabs/xl-deploy-server/log \
        /opt/xebialabs/xl-deploy-server/work \
        /opt/xebialabs/xl-deploy-server/hotfix/lib \
        /opt/xebialabs/xl-deploy-server/hotfix/plugins \
        /opt/xebialabs/xl-deploy-server/hotfix/satellite-lib \
        | kubectl exec -n nsxld -i dai-xld-master-pv-access-nsxld -- tar xvf - -C /    
    ```
  
  * 6. Chmod of the moved folder as below
    ```shell
    ❯ kubectl exec -n nsxld -i dai-xld-master-pv-access-nsxld -- chmod -R 777 /opt/xebialabs/xl-deploy-server/centralConfiguration/
    ❯ kubectl exec -n nsxld -i dai-xld-master-pv-access-nsxld -- chmod -R 777 /opt/xebialabs/xl-deploy-server/conf/
    ❯ kubectl exec -n nsxld -i dai-xld-master-pv-access-nsxld -- chmod -R 777 /opt/xebialabs/xl-deploy-server/ext/
    ❯ kubectl exec -n nsxld -i dai-xld-master-pv-access-nsxld -- chmod -R 777 /opt/xebialabs/xl-deploy-server/log/
    ❯ kubectl exec -n nsxld -i dai-xld-master-pv-access-nsxld -- chmod -R 777 /opt/xebialabs/xl-deploy-server/work/
    ❯ kubectl exec -n nsxld -i dai-xld-master-pv-access-nsxld -- chmod -R 777 /opt/xebialabs/xl-deploy-server/hotfix/lib/
    ❯ kubectl exec -n nsxld -i dai-xld-master-pv-access-nsxld -- chmod -R 777 /opt/xebialabs/xl-deploy-server/hotfix/plugins/
    ❯ kubectl exec -n nsxld -i dai-xld-master-pv-access-nsxld -- chmod -R 777 /opt/xebialabs/xl-deploy-server/hotfix/satellite-lib/
    ```
  
  * 7. Delete the pods
    ```shell
    ❯ kubectl delete pod dai-xld-master-pv-access-nsxld -n nsxld
    ❯ kubectl delete pod dai-xld-master-pv-access-default -n default
    ```

##### C.4.OPTION_1.2 Worker - Start following pods
* 1. Put following in file `pod-dai-xld-worker-pv-access-nsxld.yaml` (don't forget to update nsxld with real namespace name):

  * If version below 22.0.
      ```yaml
      apiVersion: v1
      kind: Pod
      metadata:
        name: dai-xld-worker-pv-access-nsxld
      spec:
        containers:
          - name: sleeper
            command: ["sleep", "1d"]
            image: xebialabs/tiny-tools:22.2.0
            imagePullPolicy: Always
            volumeMounts:
              - name: data-dir
                mountPath: /opt/xebialabs/xl-deploy-server/work
                subPath: work
              - name: data-dir
                mountPath: /opt/xebialabs/xl-deploy-server/conf
                subPath: conf
              - name: data-dir
                mountPath: /opt/xebialabs/xl-deploy-server/centralConfiguration
                subPath: centralConfiguration
              - name: data-dir
                mountPath: /opt/xebialabs/xl-deploy-server/ext
                subPath: ext
              - name: data-dir
                mountPath: /opt/xebialabs/xl-deploy-server/hotfix/lib
                subPath: lib
              - name: data-dir
                mountPath: /opt/xebialabs/xl-deploy-server/hotfix/plugins
                subPath: plugins
              - name: data-dir
                mountPath: /opt/xebialabs/xl-deploy-server/hotfix/satellite-lib
                subPath: satellite-lib
              - name: data-dir
                mountPath: /opt/xebialabs/xl-deploy-server/log
                subPath: log
        restartPolicy: Never
        volumes:
          - name: reports-dir
            persistentVolumeClaim:
              claimName: data-dir-dai-xld-nsxld-digitalai-deploy-worker-0
      ```
 * If xl-deploy version above 22.0
    ```yaml
    apiVersion: v1
    kind: Pod
    metadata:
      name: dai-xld-worker-pv-access-nsxld
    spec:
      containers:
        - name: sleeper
          command: ["sleep", "1d"]
          image: xebialabs/tiny-tools:22.2.0
          imagePullPolicy: Always
          volumeMounts:
            - name: data-dir
              mountPath: /opt/xebialabs/deploy-task-engine/work
              subPath: work
            - name: data-dir
              mountPath: /opt/xebialabs/deploy-task-engine/conf
              subPath: conf
            - name: data-dir
              mountPath: /opt/xebialabs/deploy-task-engine/centralConfiguration
              subPath: centralConfiguration
            - name: data-dir
              mountPath: /opt/xebialabs/deploy-task-engine/ext
              subPath: ext
            - name: data-dir
              mountPath: /opt/xebialabs/deploy-task-engine/hotfix/lib
              subPath: lib
            - name: data-dir
              mountPath: /opt/xebialabs/deploy-task-engine/hotfix/plugins
              subPath: plugins
            - name: data-dir
              mountPath: /opt/xebialabs/deploy-task-engine/hotfix/satellite-lib
              subPath: satellite-lib
            - name: data-dir
              mountPath: /opt/xebialabs/deploy-task-engine/log
              subPath: log
      restartPolicy: Never
      volumes:
        - name: reports-dir
          persistentVolumeClaim:
            claimName: data-dir-dai-xld-nsxld-digitalai-deploy-worker-0
    ```
    Update the claimName with correct name!

* 2. Start the pod
    ```shell
    ❯ kubectl apply -f pod-dai-xld-worker-pv-access-nsxld.yaml -n nsxld
    ```

* 3. Put following in file `pod-dai-xld-worker-pv-access-default.yaml` for the default namespace:
    ```yaml
    apiVersion: v1
    kind: Pod
    metadata:
      name: dai-xld-worker-pv-access-default
    spec:
      containers:
        - name: sleeper
          command: ["sleep", "1d"]
          image: xebialabs/tiny-tools:22.2.0
          imagePullPolicy: Always
          volumeMounts:
            - name: data-dir
              mountPath: /opt/xebialabs/xl-deploy-server/work
              subPath: work
            - name: data-dir
              mountPath: /opt/xebialabs/xl-deploy-server/conf
              subPath: conf
            - name: data-dir
              mountPath: /opt/xebialabs/xl-deploy-server/centralConfiguration
              subPath: centralConfiguration
            - name: data-dir
              mountPath: /opt/xebialabs/xl-deploy-server/ext
              subPath: ext
            - name: data-dir
              mountPath: /opt/xebialabs/xl-deploy-server/hotfix/lib
              subPath: lib
            - name: data-dir
              mountPath: /opt/xebialabs/xl-deploy-server/hotfix/plugins
              subPath: plugins
            - name: data-dir
              mountPath: /opt/xebialabs/xl-deploy-server/hotfix/satellite-lib
              subPath: satellite-lib
            - name: data-dir
              mountPath: /opt/xebialabs/xl-deploy-server/log
              subPath: log
      restartPolicy: Never
      volumes:
        - name: data-dir
          persistentVolumeClaim:
            claimName: data-dir-dai-xld-digitalai-deploy-worker-0
    ```

* 4. Start the pod
    ```shell
    ❯ kubectl apply -f pod-dai-xld-worker-pv-access-default.yaml -n default
    ```

* 5. Copy data from one pod.
  * If the xl-deploy version is below 22.0
    ```shell
    ❯ kubectl exec -n default dai-xld-worker-pv-access-default -- tar cf - \
        /opt/xebialabs/xl-deploy-server/centralConfiguration \
        /opt/xebialabs/xl-deploy-server/conf \
        /opt/xebialabs/xl-deploy-server/ext \
        /opt/xebialabs/xl-deploy-server/log \
        /opt/xebialabs/xl-deploy-server/work \
        /opt/xebialabs/xl-deploy-server/hotfix/lib \
        /opt/xebialabs/xl-deploy-server/hotfix/plugins \
        /opt/xebialabs/xl-deploy-server/hotfix/satellite-lib \
        | kubectl exec -n nsxld -i dai-xld-worker-pv-access-nsxld -- tar xvf - -C /
    ```
  * If xl-deploy version is above 22.0, copy the file to local directory from pod [dai-xld-worker-pv-access-default] and copy the same file from local directory to pod [dai-xld-worker-pv-access-nsxld]
    
    * Copying the centralConfiguration folder from dai-xld-worker-pv-access-default pod to local directory. 
      ```shell
      ❯ kubectl cp -n default dai-xld-digitalai-deploy-worker-0:/opt/xebialabs/xl-deploy-server/centralConfiguration /home/sishwarya/SprintTicket/S-84982_ns_xld_migration/B-defaultns-downtime/pv_backup/option1-deploy/nsxld/data/centralConfiguration
      ```
    * Copying the centralConfiguration folder from local directory to pod dai-xld-worker-pv-access-nsxld.
      ```shell
      ❯ kubectl cp /home/sishwarya/SprintTicket/S-84982_ns_xld_migration/B-defaultns-downtime/pv_backup/option1-deploy/nsxld/data/work -n nsxld dai-xld-worker-pv-access-nsxld:/opt/xebialabs/deploy-task-engine/
      ```
    
    Do the above steps for all directory which we need to migrate. eg: ext, log, work, etc.
* 6. Chmod of the moved folder
    ```shell
    ❯ kubectl exec -n nsxld -i dai-xld-worker-pv-access-nsxld -- chmod -R 777 /opt/xebialabs/xl-deploy-server/work/
    ❯ kubectl exec -n nsxld -i dai-xld-worker-pv-access-nsxld -- chmod -R 777 /opt/xebialabs/xl-deploy-server/conf/
    ```

* 7. Delete the pods
  ```shell
  ❯ kubectl delete pod dai-xld-worker-pv-access-nsxld -n nsxld
  ❯ kubectl delete pod dai-xld-worker-pv-access-default -n default
  ```

### C.4.OPTION_2 Move existing PVC to the custom namespace by reusing PV

Following option will reuse PV in the new namespace, rollback of the option is more complicated. 

* 1. Delete all the current PVCs in the namespace `default`
  ```
  ❯ kubectl delete pvc data-dir-dai-xld-digitalai-deploy-master-0 -n default
  ```

* 2. See that the related PV Status will be changed from `Bound` to `Released`:
  ```
  ❯ kubectl get pv pvc-1df72d76-7970-43fa-b30f-77b6a0d07239 pvc-3f4052d9-a614-4d0f-a886-a5699dac4d5e -n default
  NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS     CLAIM                                                STORAGECLASS          REASON   AGE
  pvc-1df72d76-7970-43fa-b30f-77b6a0d07239   10Gi       RWO            Retain           Released   default/data-dir-dai-xld-digitalai-deploy-master-0   aws-efs-provisioner            5h55m
  pvc-3f4052d9-a614-4d0f-a886-a5699dac4d5e   10Gi       RWO            Retain           Released   default/data-dir-dai-xld-digitalai-deploy-worker-0   aws-efs-provisioner            5h55m
  ```

* 3. Edit each one of the PVs to remove the old references with claim:
  ```
  ❯ kubectl edit pv pvc-1df72d76-7970-43fa-b30f-77b6a0d07239
  ```
  Remove lines like following example:
  ```yaml
  ...
  claimRef:
      apiVersion: v1
      kind: PersistentVolumeClaim
      name: data-dir-dai-xld-digitalai-deploy-master-0
      namespace: default
      resourceVersion: "23284462"
      uid: 53564205-6e1e-45f0-9dcf-e21adefa6eaf
  ...
  ```
  ```yaml
  ...
  claimRef:
    apiVersion: v1
    kind: PersistentVolumeClaim
    name: data-dir-dai-xld-digitalai-deploy-worker-0
    namespace: default
    resourceVersion: "34085986"
    uid: c7a3176c-9721-472b-94a3-dd5132a550a1
  ...
  ```

* 4. Check that there are no references anymore in the CLAIM column:
  ```
  ❯ kubectl get pv pvc-1df72d76-7970-43fa-b30f-77b6a0d07239 pvc-3f4052d9-a614-4d0f-a886-a5699dac4d5e -n default
  NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS          REASON   AGE
  pvc-1df72d76-7970-43fa-b30f-77b6a0d07239   10Gi       RWO            Retain           Available           aws-efs-provisioner            5h58m
  pvc-3f4052d9-a614-4d0f-a886-a5699dac4d5e   10Gi       RWO            Retain           Available           aws-efs-provisioner            5h58m
  ```

#### C.4.OPTION_2.1 Make the copy of the `pvc-data-dir-dai-xld-digitalai-deploy-master-0.yaml` for the later reference, to the `pvc-data-dir-dai-xld-digitalai-deploy-master-0-nsxld.yaml`.
* 1. Edit file `pvc-data-dir-dai-xld-digitalai-deploy-master-0-nsxld.yaml`:
  * 1. Delete all the lines under sections:
      - `status`
      - `spec.volumneMode`
      - `spec.volumneName`
      - `metadata.uid`
      - `metadata.resourceVersion`
      - `metadata.namespace`
      - `metadata.creationTimestamp`
      - `metadata.finalizers`
      - `metadata.annotations.pv.kubernetes.io/bind-completed`
      - `metadata.annotations.pv.kubernetes.io/bound-by-controller`
  
  * 2. Rename following lines by adding namespace name:
      - `metadata.name` from data-dir-dai-xld-digitalai-deploy-master-0 to data-dir-dai-xld-nsxld-digitalai-deploy-master-0
      - `metadata.labels.release` from dai-xld to dai-xld-nsxld
      - `metadata.annotations.meta.helm.sh/release-namespace` from default to nsxld
      - `metadata.annotations.meta.helm.sh/release-name` from dai-xld to dai-xld-nsxld
    The renaming rule is to replace any occurrence of `dai-xld` with `dai-xld-{{custom_namespace_name}}`
  
  Similarly do the above steps for other PVs [eg: Worker, postgresql ]

* 2. Create those PVCs again, but inside the Namespace “nsxld”:
    ```
    ❯ kubectl apply -f pvc-data-dir-dai-xld-digitalai-deploy-master-0-nsxld.yaml -n nsxld
    persistentvolumeclaim/data-dir-dai-xld-nsxld-digitalai-deploy-master-0 created
    ❯ kubectl apply -f pvc-data-dir-dai-xld-digitalai-deploy-worker-0-nsxld.yaml -n nsxld
    persistentvolumeclaim/data-dir-dai-xld-nsxld-digitalai-deploy-worker-0 created
    ❯ kubectl apply -f pvc-data-dai-xld-postgresql-0-nsxld.yaml -n nsxld
    persistentvolumeclaim/data-dai-xld-nsxld-postgresql-0 created
    ```

* 3. Check the PVCs state, which will probably in Pending state, and after some time in Bound state:
    ```
    ❯ kubectl get pv
    NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                                                    STORAGECLASS          REASON   AGE
    pvc-1df72d76-7970-43fa-b30f-77b6a0d07239   10Gi       RWO            Retain           Bound    nsxld/data-dir-dai-xld-nsxld-digitalai-deploy-worker-0   aws-efs-provisioner            6h39m
    pvc-2ccabe5e-c540-42c4-92c9-08bbac24e306   50Gi       RWO            Retain           Bound    nsxld/data-dai-xld-nsxld-postgresql-0                    aws-efs-provisioner            6h39m
    pvc-3f4052d9-a614-4d0f-a886-a5699dac4d5e   10Gi       RWO            Retain           Bound    nsxld/data-dir-dai-xld-nsxld-digitalai-deploy-master-0   aws-efs-provisioner            6h39m
    ```
* 4. On the moved PV for the deploy, if you need to modify, delete or empty some folders, do that with following.
   * Create the master pod in custom namespace [eg: nsxdd], Similar to step C.4.OPTION_1.2 Master - Start following pods.
     * Connect to the master pod
      ```shell
       ❯ kubectl exec -it dai-xld-master-pv-access-nsxld -- sh
      ```
     * Remove/Update the file if required.
   * Delete the master pod.
  
  Similarly do it for worker if required.
     
### C.4.OPTION_3 Clone existing PVC to the custom namespace by CSI Volume Cloning

Please check following document if this option is possible for your Persisted Volume setup (there are some limitations when it is possible):

[CSI Volume Cloning](https://kubernetes.io/docs/concepts/storage/volume-pvc-datasource/)
