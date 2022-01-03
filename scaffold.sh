cd golang
rm -rf *
operator-sdk init --domain digital.ai --repo github.com/xebialabs/xl-deploy-kubernetes-operator --project-version=3
operator-sdk create api --group xld --version v1alpha1 --kind DigitalaiDeploy --resource --controller
operator-sdk olm install

#curl -L https://github.com/operator-framework/operator-lifecycle-manager/releases/download/v0.19.1/install.sh -o install.sh
#chmod +x install.sh
#./install.sh v0.19.1
