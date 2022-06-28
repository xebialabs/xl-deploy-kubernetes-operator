cd xld-operator
rm -rf *
operator-sdk init --domain digital.ai --repo github.com/xebialabs/xl-deploy-kubernetes-operator
operator-sdk create api --group xld --version v1alpha1 --kind DigitalaiDeploy --resource --controller
operator-sdk olm install

# Run manually: make bundle
# make run install

# Make sure first that you logged into your Docker account

# make docker-build
# make docker-push

# To check how your operator works:
# make deploy

# To roll back your operator:
# make undeploy
