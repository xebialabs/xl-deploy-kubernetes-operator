cd golang
rm -rf *
operator-sdk init --domain digital.ai --repo github.com/xebialabs/xl-deploy-kubernetes-operator
operator-sdk create api --group xld --version v1alpha1 --kind DigitalaiDeploy --resource --controller


