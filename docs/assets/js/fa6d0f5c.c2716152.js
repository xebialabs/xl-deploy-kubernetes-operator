"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[638],{3905:function(e,t,a){a.d(t,{Zo:function(){return m},kt:function(){return d}});var r=a(7294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function l(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?l(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):l(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function p(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},l=Object.keys(e);for(r=0;r<l.length;r++)a=l[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)a=l[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var s=r.createContext({}),i=function(e){var t=r.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},m=function(e){var t=i(e.components);return r.createElement(s.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,l=e.originalType,s=e.parentName,m=p(e,["components","mdxType","originalType","parentName"]),u=i(a),d=n,f=u["".concat(s,".").concat(d)]||u[d]||c[d]||l;return a?r.createElement(f,o(o({ref:t},m),{},{components:a})):r.createElement(f,o({ref:t},m))}));function d(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var l=a.length,o=new Array(l);o[0]=u;var p={};for(var s in t)hasOwnProperty.call(t,s)&&(p[s]=t[s]);p.originalType=e,p.mdxType="string"==typeof e?e:n,o[1]=p;for(var i=2;i<l;i++)o[i]=a[i];return r.createElement.apply(null,o)}return r.createElement.apply(null,a)}u.displayName="MDXCreateElement"},7676:function(e,t,a){a.r(t),a.d(t,{frontMatter:function(){return p},contentTitle:function(){return s},metadata:function(){return i},toc:function(){return m},default:function(){return u}});var r=a(7462),n=a(3366),l=(a(7294),a(3905)),o=["components"],p={sidebar_position:7},s="Adding truststore files",i={unversionedId:"manual/updating-truststore-files",id:"manual/updating-truststore-files",isDocsHomePage:!1,title:"Adding truststore files",description:"Prerequisites",source:"@site/docs/manual/updating-truststore-files.md",sourceDirName:"manual",slug:"/manual/updating-truststore-files",permalink:"/xl-deploy-kubernetes-operator/docs/manual/updating-truststore-files",tags:[],version:"current",sidebarPosition:7,frontMatter:{sidebar_position:7},sidebar:"tutorialSidebar",previous:{title:"Updating configuration files on Deploy",permalink:"/xl-deploy-kubernetes-operator/docs/manual/updating-configuration-files"},next:{title:"Setting up custom namespace",permalink:"/xl-deploy-kubernetes-operator/docs/manual/setting-up-custom-namespace"}},m=[{value:"Prerequisites",id:"prerequisites",children:[],level:2},{value:"Adding truststore file generic example for Deploy.",id:"adding-truststore-file-generic-example-for-deploy",children:[],level:2},{value:"Update xld-wrapper.conf.common.",id:"update-xld-wrapperconfcommon",children:[],level:2}],c={toc:m};function u(e){var t=e.components,p=(0,n.Z)(e,o);return(0,l.kt)("wrapper",(0,r.Z)({},c,p,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("h1",{id:"adding-truststore-files"},"Adding truststore files"),(0,l.kt)("h2",{id:"prerequisites"},"Prerequisites"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},"Linux environment"),(0,l.kt)("li",{parentName:"ul"},"The kubectl command-line tool"),(0,l.kt)("li",{parentName:"ul"},"The yq command-line tool (",(0,l.kt)("a",{parentName:"li",href:"https://github.com/mikefarah/yq/releases"},"Use the latest binary"),")"),(0,l.kt)("li",{parentName:"ul"},"Access to a Kubernetes cluster with installed deploy")),(0,l.kt)("h2",{id:"adding-truststore-file-generic-example-for-deploy"},"Adding truststore file generic example for Deploy."),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Add certificate to truststore (XLDTruststore.jks)"),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-shell"}," keytool -import -alias exampleCert -file exampleCert.cer -keystore XLDTruststore.jks\n"))))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},'Create secret yaml "xld-trust-store_secret.yaml"'),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},"cat XLDTruststore.jsk | base64"),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-yaml"}," apiVersion: v1\n kind: Secret\n metadata:\n name: xld-secret-store\n namespace: default\n data:\n   XLDTruststore.jks: \"<base 64 from previous command here 'cat XLDTruststore.jks | base64'>\"       \n"))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-shell"}," kubectl apply -f xld-trust-store_secret.yaml\n"))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-shell"}," kubectl get secret xld-secret-store\n [sishwarya@localhost deploy] (ENG-9190) $ kubectl get secret xld-secret-store\n  NAME               TYPE     DATA   AGE\n  xld-secret-store   Opaque   1      5m2s\n"))))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"By editing STS, create volumemount and volumes for the created secret in above step."),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},(0,l.kt)("img",{alt:"Before volume mount",src:a(7639).Z}))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Create volumemount and volumes for the created secret."),(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-shell"},"   kubectl get statefulset.apps/dai-xld-digitalai-deploy-master -o yaml > deploy_sts.yaml\n")),(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},"update the volume mount and volume for secret.",(0,l.kt)("ul",{parentName:"li"},(0,l.kt)("li",{parentName:"ul"},"volume mount",(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-yaml"},"    volumeMounts:\n    - mountPath: /mnt/secrets\n       name: xld-secret-store-volume\n       readOnly: true\n"))),(0,l.kt)("li",{parentName:"ul"},"volume",(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-yaml"},"     volumes:\n     - name: xld-secret-store-volume\n       secret:\n          secretName: xld-secret-store\n          items:\n          - key: XLDTruststore.jks\n            path: XLDTruststore.jks\n"))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-shell"},"kubectl apply -f deploy_sts.yaml\n"))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("img",{alt:"After volume mount",src:a(1256).Z})))))))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Restart Deploy masters:"),(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-shell"},"\u276f kubectl delete pod dai-xld-digitalai-deploy-master-0\n")))),(0,l.kt)("h2",{id:"update-xld-wrapperconfcommon"},"Update xld-wrapper.conf.common."),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Configure Deploy to use the truststore.")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Get current xld-wrapper.conf.common file from the deploy server node:"),(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-shell"},"\u276f kubectl cp dai-xld-digitalai-deploy-master-0:/opt/xebialabs/xl-deploy-server/conf/xld-wrapper.conf.common ./xld-wrapper.conf.common\n"))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Create following template file to append to it the retrieved ",(0,l.kt)("inlineCode",{parentName:"p"},"./xld-wrapper.conf.common"),":"),(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-shell"},"\u276f echo 'apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: xld-wrapper-conf-common-config-map\n  labels:\n    app: digitalai-deploy\ndata:\n  xld-wrapper.conf.common: |' > config-patch-xld-wrapper-conf-common.yaml.template\n"))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Merge the files:"),(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-shell"},"\u276f cat config-patch-xld-wrapper-conf-common.yaml.template > config-patch-xld-wrapper-conf-common.yaml\n\u276f sed -e 's/^/     /' xld-wrapper.conf.common >> config-patch-xld-wrapper-conf-common.yaml\n"))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Change the config in the ",(0,l.kt)("inlineCode",{parentName:"p"},"config-patch-xld-wrapper-conf-common.yaml"),"."),(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-text"},"Add the following line, where \u2018X\u2019 is the next number in the wrapper.java.additional list:\nwrapper.java.additional.X=-Djavax.net.ssl.trustStore=/mnt/secrets/XLDTruststore.jks\nwrapper.java.additional.X+1=-Djavax.net.ssl.trustStorePassword=changeit\n"))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Create the config map with ",(0,l.kt)("inlineCode",{parentName:"p"},"config-patch-xld-wrapper-conf-common.yam"),":"),(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-shell"},"\u276f kubectl create -f config-patch-xld-wrapper-conf-common.yaml\n"))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Get all statefulsets (deploy statefulset will be suffixed with ",(0,l.kt)("inlineCode",{parentName:"p"},"-deploy-master"),"):"),(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-shell"},"\u276f kubectl get sts -o name\n"))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Change the statefulset for the deploy server by adding volume mounts and volumes:"),(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-shell"},'\u276f kubectl get statefulset.apps/dai-xld-digitalai-deploy-master -o yaml \\\n    | yq eval \'.spec.template.spec.containers[0].volumeMounts += {\n        "mountPath": "/opt/xebialabs/xl-deploy-server/conf/xld-wrapper.conf.common",\n        "name": "xld-wrapper-conf-common-volume",\n        "subPath": "xld-wrapper.conf.common"\n      }\' - \\\n    | yq eval \'.spec.template.spec.volumes += [{\n        "name": "xld-wrapper-conf-common-volume",\n        "configMap": {\n          "name": "xld-wrapper-conf-common-config-map"\n        }\n      }]\' - \\\n    | kubectl replace -f -\n'))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},"Restart Deploy masters:"),(0,l.kt)("pre",{parentName:"li"},(0,l.kt)("code",{parentName:"pre",className:"language-shell"},"\u276f kubectl delete pod dai-xld-digitalai-deploy-master-0\n"))),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("p",{parentName:"li"},(0,l.kt)("img",{alt:"post updated xlr-wrapper-linux.conf",src:a(3750).Z})))))}u.isMDXComponent=!0},7639:function(e,t,a){t.Z=a.p+"assets/images/before_secret_volumnemount-5d35465cf1e86c3fc93c2a89465fb4f4.png"},3750:function(e,t,a){t.Z=a.p+"assets/images/post_update_config_map-580f1a7942c5f5b3d07d3a35b8685625.png"},1256:function(e,t,a){t.Z=a.p+"assets/images/post_volumemount_secret-40f8b072c1807587ed975757c40d4250.png"}}]);