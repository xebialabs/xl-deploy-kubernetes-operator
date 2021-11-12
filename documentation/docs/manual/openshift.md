---
sidebar_position: 2
---

# AWS OpenShift

Here it will described how to install manually Deploy k8s cluster with help of operator to Open Shift. 
As a tool to work with is taken AWS OpenShift.

* First of all you should configure your [AWS CLI locally](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)
* Create an account in RedHat and follow the procedure of installing ROSA https://docs.openshift.com/rosa/rosa_getting_started/rosa-installing-rosa.html
* Once it is done, it's very important to [configure IdP (identity provider)](https://docs.openshift.com/rosa/rosa_getting_started/rosa-config-identity-providers.html) in order to be able to access the cluster via `serverURL` and `token`.
These 2 parameters are used in Deploy to have a communication with OpenShift cluster.   
If it was configured correctly this command will succeed:
```shell script
oc login --token=TOKEN --server=SERVER_URL
```

`SERVER_URL` you can find the next way.
 
First find the cluster's console URL in the output of command:

```shell script
rosa describe cluster --cluster=CLUSTER_NAME
```

When you open it, you will see on `Cluster` tab your new created cluster
![Openshift Clusters](./pics/openshift-clusters.png)

Click on it, and open `Networking` tab
![Openshift Networking](./pics/openshift-networking.png).

"Control Plane API endpoint" is your SERVER_URL.
"Default application router" you have to use in `DigitalaiDeployOcp` to speicfy the `hosts` field. 
Only be aware that it should have only hostname, no protocol or port defined. So for this example it will be
```yaml
hosts:
    - apps.acierto.lnfl.p1.openshiftapps.com
```

* Also very important thing, when IdP is created, you have to create a user with the same name. You can find it here:
![OpenShift Access Control](./pics/openshift-access-control.png)

When all configuration is done, and you deployed the Operator, you can interact with the cluster with help of `oc`.
Just instead of `kubectl` will be `oc`.
