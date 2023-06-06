"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[145],{3905:function(e,a,t){t.d(a,{Zo:function(){return c},kt:function(){return d}});var n=t(7294);function r(e,a,t){return a in e?Object.defineProperty(e,a,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[a]=t,e}function l(e,a){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);a&&(n=n.filter((function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable}))),t.push.apply(t,n)}return t}function s(e){for(var a=1;a<arguments.length;a++){var t=null!=arguments[a]?arguments[a]:{};a%2?l(Object(t),!0).forEach((function(a){r(e,a,t[a])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):l(Object(t)).forEach((function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))}))}return e}function i(e,a){if(null==e)return{};var t,n,r=function(e,a){if(null==e)return{};var t,n,r={},l=Object.keys(e);for(n=0;n<l.length;n++)t=l[n],a.indexOf(t)>=0||(r[t]=e[t]);return r}(e,a);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)t=l[n],a.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var o=n.createContext({}),p=function(e){var a=n.useContext(o),t=a;return e&&(t="function"==typeof e?e(a):s(s({},a),e)),t},c=function(e){var a=p(e.components);return n.createElement(o.Provider,{value:a},e.children)},m={inlineCode:"code",wrapper:function(e){var a=e.children;return n.createElement(n.Fragment,{},a)}},u=n.forwardRef((function(e,a){var t=e.components,r=e.mdxType,l=e.originalType,o=e.parentName,c=i(e,["components","mdxType","originalType","parentName"]),u=p(t),d=r,k=u["".concat(o,".").concat(d)]||u[d]||m[d]||l;return t?n.createElement(k,s(s({ref:a},c),{},{components:t})):n.createElement(k,s({ref:a},c))}));function d(e,a){var t=arguments,r=a&&a.mdxType;if("string"==typeof e||r){var l=t.length,s=new Array(l);s[0]=u;var i={};for(var o in a)hasOwnProperty.call(a,o)&&(i[o]=a[o]);i.originalType=e,i.mdxType="string"==typeof e?e:r,s[1]=i;for(var p=2;p<l;p++)s[p]=t[p];return n.createElement.apply(null,s)}return n.createElement.apply(null,t)}u.displayName="MDXCreateElement"},1758:function(e,a,t){t.r(a),t.d(a,{frontMatter:function(){return i},contentTitle:function(){return o},metadata:function(){return p},toc:function(){return c},default:function(){return u}});var n=t(7462),r=t(3366),l=(t(7294),t(3905)),s=["components"],i={sidebar_position:3,data:"Internal Only"},o=void 0,p={unversionedId:"manual/aws-eks",id:"manual/aws-eks",isDocsHomePage:!1,title:"aws-eks",description:"This is internal documentation. This document can be used only if it was recommended by the Support Team.",source:"@site/docs/manual/aws-eks.md",sourceDirName:"manual",slug:"/manual/aws-eks",permalink:"/xl-deploy-kubernetes-operator/docs/manual/aws-eks",tags:[],version:"current",sidebarPosition:3,frontMatter:{sidebar_position:3,data:"Internal Only"},sidebar:"tutorialSidebar",previous:{title:"openshift",permalink:"/xl-deploy-kubernetes-operator/docs/manual/openshift"},next:{title:"azure-aks",permalink:"/xl-deploy-kubernetes-operator/docs/manual/azure-aks"}},c=[{value:"Troubleshooting",id:"troubleshooting",children:[],level:2}],m={toc:c};function u(e){var a=e.components,i=(0,r.Z)(e,s);return(0,l.kt)("wrapper",(0,n.Z)({},m,i,{components:a,mdxType:"MDXLayout"}),(0,l.kt)("div",{className:"admonition admonition-caution alert alert--warning"},(0,l.kt)("div",{parentName:"div",className:"admonition-heading"},(0,l.kt)("h5",{parentName:"div"},(0,l.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,l.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 16 16"},(0,l.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"}))),"caution")),(0,l.kt)("div",{parentName:"div",className:"admonition-content"},(0,l.kt)("p",{parentName:"div"},"This is internal documentation. This document can be used only if it was recommended by the Support Team."))),(0,l.kt)("h1",{id:"aws-eks"},"AWS EKS"),(0,l.kt)("p",null,"Here it will described how to install manually Deploy k8s cluster with help of operator to AWS EKS."),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Create Access key ID and secret access key."),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Using My security credentials."),(0,l.kt)("p",{parentName:"li"},(0,l.kt)("img",{alt:"Access key",src:t(9392).Z}))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},'AWS SSO access use "Command line or programmatic access"'),(0,l.kt)("p",{parentName:"li"},(0,l.kt)("img",{alt:"AWS EKS Cluster role",src:t(2697).Z})))))),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},(0,l.kt)("a",{parentName:"p",href:"https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"},"Install AWS CLI locally"))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},(0,l.kt)("a",{parentName:"p",href:"https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html"},"Configure AWS CLI locally"),"\n")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Use existing VPC or optionally ",(0,l.kt)("a",{parentName:"p",href:"https://docs.aws.amazon.com/eks/latest/userguide/create-public-private-vpc.html"},"Create VPC and Subnets"),".\n",(0,l.kt)("img",{alt:"Create VPC",src:t(2621).Z}),"\n")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Create ",(0,l.kt)("a",{parentName:"p",href:"https://docs.aws.amazon.com/eks/latest/userguide/service_IAM_role.html"},"AWS EKS cluster role")),(0,l.kt)("p",{parentName:"li"},"  ",(0,l.kt)("img",{alt:"AWS EKS Cluster role",src:t(8218).Z}))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Create ",(0,l.kt)("a",{parentName:"p",href:"https://docs.aws.amazon.com/eks/latest/userguide/create-node-role.html"},"EC2 node group role")),(0,l.kt)("p",{parentName:"li"},"  ",(0,l.kt)("img",{alt:"EC2 node group role",src:t(4890).Z}))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Create ",(0,l.kt)("a",{parentName:"p",href:"https://docs.aws.amazon.com/eks/latest/userguide/create-cluster.html"},"EKS cluster"))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Create ",(0,l.kt)("a",{parentName:"p",href:"https://docs.aws.amazon.com/eks/latest/userguide/create-managed-node-group.html"},"node group"),".    "))),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Configure the connection details as part of your local aws setup."),(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-shell",metastring:"script",script:!0},'[sishwarya@localhost aws] $ rm -rf ~/.kube/config (optional)\n\n[sishwarya@localhost aws] $ aws configure\nAWS Access Key ID [None]: ASIA5SLLVCFXXXXXXX\nAWS Secret Access Key [None]: NkQ9lQnsYXLp2t3TKXXXXXXXXXXXXX\nDefault region name [None]: \nDefault output format [None]: json\n\n[sishwarya@localhost aws] $ export AWS_ACCESS_KEY_ID="ASIA5SLLVCFXXXXXXX"\n[sishwarya@localhost aws] $ export AWS_SECRET_ACCESS_KEY="NkQ9lQnsYXLp2t3TKXXXXXXXXXXXXX"\n[sishwarya@localhost aws] $ export AWS_SESSION_TOKEN="IQoJb3JpZ2luX2VjEAIaCXVzLXdlXXXXXXXXXXXXXx"\n')),(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-shell",metastring:"script",script:!0},"aws eks --region eu-west-1 update-kubeconfig --name CLUSTER_NAME\n")),(0,l.kt)("p",{parentName:"li"},"  ",(0,l.kt)("inlineCode",{parentName:"p"},"CLUSTER_NAME")," name of the cluster created in a previous step."),(0,l.kt)("p",{parentName:"li"},"  ",(0,l.kt)("img",{alt:"Updating kube config",src:t(431).Z}))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Validate the connection using kubectl. "),(0,l.kt)("p",{parentName:"li"},"  ",(0,l.kt)("img",{alt:"validate_connection",src:t(6296).Z}))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Update the kube config of aws-auth."),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},"Edit the configmap ",(0,l.kt)("inlineCode",{parentName:"li"},"kubectl edit configmap -n kube-system aws-auth"),".",(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},"AWS SSO user. Add the map role.",(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-yaml"},"     mapRoles:\n        ----\n        - groups:\n          - system:bootstrappers\n          - system:nodes\n          rolearn: arn:aws:iam::932770550094:role/aws-reserved/sso.amazonaws.com/us-west-2/AWSReservedSSO_XLD-XXXXXXX\n          username: AWSReservedSSO_XLD-XXXXXXX\n"))),(0,l.kt)("li",{parentName:"ul"},"Normal user. Add the map user.",(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-yaml"},"    mapUsers: |\n        - userarn: arn:aws:iam::932770550094:user/<userName>\n          username: <username>\n          groups:\n            - system:masters\n"))))),(0,l.kt)("li",{parentName:"ul"},"Verify updated configmap ",(0,l.kt)("inlineCode",{parentName:"li"},"kubectl describe configmap -n kube-system aws-auth"),"."))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Update the infrastructure.yaml and  run xl apply -f infrastructure.yaml and validate the connection by performing check connection in xl-deploy env."),(0,l.kt)("p",{parentName:"li"},"  ",(0,l.kt)("img",{alt:"infra",src:t(7356).Z})),(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-yaml"},"apiVersion: xl-deploy/v1\nkind: Infrastructure\nspec:\n  - name: k8s-infra\n    type: core.Directory\n    children:\n      - name: xld\n        type: k8s.Master\n        apiServerURL: >-\n          <API SERVER ENDPOINT>\n        skipTLS: true\n        debug: true\n        caCert: >-\n          <CERTIFICATE AUTHORITY>\n        isEKS: true\n        useGlobal: true\n        regionName: eu-west-1\n        clusterName: <CLUSTER NAME>\n        accessKey: <ACCESS KEY> (optional when we use AWS SSO)\n        accessSecret: <SECRET KEY> (optional when we use AWS SSO)\n        children:\n          - name: default\n            type: k8s.Namespace\n            namespaceName: default\n"))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Verify Check connection."),(0,l.kt)("p",{parentName:"li"},"  ",(0,l.kt)("img",{alt:"check connection",src:t(6331).Z}))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Register the domain using Route 53."),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Go ",(0,l.kt)("a",{parentName:"p",href:"https://console.aws.amazon.com/route53/v2/home#Dashboard"},"Route 53 console"),".")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Select hostedZone. Create hosted zone or select available one (",(0,l.kt)("strong",{parentName:"p"},(0,l.kt)("em",{parentName:"strong"},"digitalai-testing.com")),").")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},(0,l.kt)("a",{parentName:"p",href:"https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-creating.html"},"Create record"),"."),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Enable toggle  alias")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Route Traffic to = Alias to Application and Classic Load Balancer.")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Routing policy = (default value)")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Record type = (default value)")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Record Name = deploy"),(0,l.kt)("p",{parentName:"li"},(0,l.kt)("img",{alt:"route 53",src:t(8544).Z}))))))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Go through the process of scaffolding."),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},"Update the xld_v1alpha1_digitalaideploy.yaml file",(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},"Change StorageClass to what you have. For example, you can use 'gp2', in case of using aws local file system.\nIt depends ",(0,l.kt)("a",{parentName:"li",href:"https://xebialabs.github.io/xl-deploy-kubernetes-helm-chart/docs/installing-storage-class"},"how you configured it"),". "),(0,l.kt)("li",{parentName:"ul"},"ingress service type: LoadBalancer."),(0,l.kt)("li",{parentName:"ul"},"Change the ingress hosts - Replace it with the domain registered in the previous step.\neg:",(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-yaml"},"    hosts:\n      - deploy.digitalai-testing.com\n"))))))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Run xl apply -v -f digital-ai.yaml")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Validate the ingress and service"))),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-shell",metastring:"script",script:!0},"[sishwarya@localhost deploy-operator-awseks] $ kubectl get ing\nNAME                                      CLASS    HOSTS                          ADDRESS   PORTS   AGE\ndigitalaideploy-sample-digitalai-deploy   <none>   deploy.digitalai-testing.com             80      75s\n\n[sishwarya@localhost deploy-operator-awseks] $ kubectl get svc\nNAME                                                              TYPE           CLUSTER-IP       EXTERNAL-IP                                                               PORT(S)                                 AGE\ncontroller-manager-metrics-service                                ClusterIP      10.100.135.147   <none>                                                                    8443/TCP                                2m14s\ndigitalaideploy-sample-digitalai-deploy-lb                        ClusterIP      10.100.91.46     <none>                                                                    4516/TCP                                88s\ndigitalaideploy-sample-digitalai-deploy-master                    ClusterIP      None             <none>                                                                    8180/TCP                                88s\ndigitalaideploy-sample-digitalai-deploy-worker                    ClusterIP      None             <none>                                                                    8180/TCP                                88s\ndigitalaideploy-sample-nginx-ingress-controller                   LoadBalancer   10.100.45.115    a69cafde4744d48cd8098fb6xxxxxx-1776330415.us-east-1.elb.amazonaws.com   80:31192/TCP,443:31498/TCP              88s\ndigitalaideploy-sample-nginx-ingress-controller-default-backend   ClusterIP      10.100.67.17     <none>                                                                    80/TCP                                  88s\ndigitalaideploy-sample-postgresql                                 ClusterIP      10.100.131.156   <none>                                                                    5432/TCP                                88s\ndigitalaideploy-sample-postgresql-headless                        ClusterIP      None             <none>                                                                    5432/TCP                                88s\ndigitalaideploy-sample-rabbitmq                                   ClusterIP      10.100.4.80      <none>                                                                    5672/TCP,4369/TCP,25672/TCP,15672/TCP   88s\ndigitalaideploy-sample-rabbitmq-headless                          ClusterIP      None             <none>                                                                    4369/TCP,5672/TCP,25672/TCP,15672/TCP   88s\nkubernetes                                                        ClusterIP      10.100.0.1       <none>                                                                    443/TCP                                 18h\n")),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Edit record of deploy-digitalai-testing.com of Route 53"),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Update region where our cluster is running")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Select the load balancer."),(0,l.kt)("p",{parentName:"li"},(0,l.kt)("img",{alt:"edit route 53",src:t(6498).Z}))))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},'Login using the domain "',(0,l.kt)("a",{parentName:"p",href:"http://deploy.digitalai-testing.com/xl-deploy%22"},'http://deploy.digitalai-testing.com/xl-deploy"')),(0,l.kt)("p",{parentName:"li"},"  ",(0,l.kt)("img",{alt:"Deploy login",src:t(5215).Z})))),(0,l.kt)("h2",{id:"troubleshooting"},"Troubleshooting"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Unauthorized error. Go to your AWS SSO command line, to verify the access and secret key."),(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-shell",metastring:"script",script:!0},"    [sishwarya@localhost bin] $ kubectl describe configmap -n kube-system aws-auth\n    error: You must be logged in to the server (Unauthorized)\n")),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},"update the latest access and secret key in bashrc",(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-shell",metastring:"script",script:!0},'              vi ~/.bashrc\n              export AWS_ACCESS_KEY_ID="ASIA5SLLVCFxxxxx"\n              export AWS_SECRET_ACCESS_KEY="NkQ9lQnsYXLp2t3TKUJiX58V0Rctkxxxx"\n              export AWS_SESSION_TOKEN="IQoJb3JpZXXXXXXX"\n              source ~/.bashrc\n'))))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"After ","[Configuring EFS]"," (",(0,l.kt)("a",{parentName:"p",href:"https://xebialabs.github.io/xl-deploy-kubernetes-helm-chart/docs/installing-storage-class"},"https://xebialabs.github.io/xl-deploy-kubernetes-helm-chart/docs/installing-storage-class"),"), if pod not initialized yet and\nif the below error observed on a pod describe."),(0,l.kt)("p",{parentName:"li"},(0,l.kt)("img",{alt:"efs mount error",src:t(828).Z})),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Go to EFS and select the file System created and go to network tab and copy the security group."),(0,l.kt)("p",{parentName:"li"},(0,l.kt)("img",{alt:"efs network",src:t(7017).Z}))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Go To EC2 and select security group and verify the in bound rules, modify and verify."),(0,l.kt)("p",{parentName:"li"},(0,l.kt)("img",{alt:"ec2 security",src:t(800).Z})),(0,l.kt)("p",{parentName:"li"},(0,l.kt)("img",{alt:"aws efs",src:t(9496).Z})))))))}u.isMDXComponent=!0},2697:function(e,a,t){a.Z=t.p+"assets/images/aws-access-commandline-5a1ac8390a96f4f0b5c5cac73e3aa787.png"},800:function(e,a,t){a.Z=t.p+"assets/images/aws-ec2-security-6b87bfd5a36063b31542bb179da4e2da.png"},6498:function(e,a,t){a.Z=t.p+"assets/images/aws-edit-route53-bcf11341b978926b240b7bc0232598b4.png"},828:function(e,a,t){a.Z=t.p+"assets/images/aws-efs-mount-error-bf90cd6f898c84b93e5cb1d0ac13c71a.png"},7017:function(e,a,t){a.Z=t.p+"assets/images/aws-efs-network-76cc39aa3978717ca1c613c959bd38bd.png"},9496:function(e,a,t){a.Z=t.p+"assets/images/aws-efs-8550ef9f75c4353e510b3a458bd7462d.png"},9392:function(e,a,t){a.Z=t.p+"assets/images/aws-eks-accesskey-f01117a32e2afd642d497f25ca47afd5.png"},6331:function(e,a,t){a.Z=t.p+"assets/images/aws-eks-checkConnection-7d4d3d99cdbe1affb1583e3f400bd12b.png"},5215:function(e,a,t){a.Z=t.p+"assets/images/aws-eks-deploylogin-797b3aa7de6f2c86d661984f18383ee7.png"},7356:function(e,a,t){a.Z=t.p+"assets/images/aws-eks-infra-bec48e3ad50c8d78d9e6e855fa84ae02.png"},431:function(e,a,t){a.Z=t.p+"assets/images/aws-eks-kubeconfig-5befad49c72cd07560c1f83f370a2750.png"},4890:function(e,a,t){a.Z=t.p+"assets/images/aws-eks-noderole-f464e336dc830e1a022185731a9f9e91.png"},8218:function(e,a,t){a.Z=t.p+"assets/images/aws-eks-servicerole-2684275039045673f452b2fc0c33a21b.png"},6296:function(e,a,t){a.Z=t.p+"assets/images/aws-eks-validate_connection-a9f7ce759dc809323cf3fb812713555e.png"},2621:function(e,a,t){a.Z=t.p+"assets/images/aws-eks-vpc-f6ad9997105e3e76d76757205371ca92.png"},8544:function(e,a,t){a.Z=t.p+"assets/images/aws-route53-4f75215f419e9a655ce43167d35d58a6.png"}}]);