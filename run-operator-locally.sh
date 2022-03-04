#!/bin/bash

# Run as `./run-cluster-locally.sh provider_name debug` in case you want to run it in a debug mode

EXTRA=""
if [[ $# > 1 ]] ; then
  if [[ $2 -eq "debug" ]] ; then
    EXTRA="-Dorg.gradle.debug=true"
  fi
fi

if [[ $# -eq 0 ]] ; then
    printf "\e[31mProvide in a first parameter a provider name!\e[m\n"
    echo "For example:"
    printf "\e[1;32m./run-operator-locally.sh aws-eks\e[0m"
    echo ""
    printf "\e[1;32m./run-operator-locally.sh azure-aks\e[0m"
    echo ""
    printf "\e[1;32m./run-operator-locally.sh gcp-gke\e[0m"
    echo ""
    printf "\e[1;32m./run-operator-locally.sh onprem\e[0m"
    echo ""
    printf "\e[1;32m./run-operator-locally.sh aws-openshift\e[0m"
fi

./gradlew shutdownIntegrationServer -PactiveProviderName=$1 --stacktrace -PazUsername=$AZURE_USERNAME -PazPassword=$AZURE_PASSWORD "-PaccountCredFile=$GCP_ACCOUNT_CRED_FILE" $EXTRA \
&& ./gradlew clean startIntegrationServer --stacktrace -PkeepServerRunning=true -PactiveProviderName=$1 -PazUsername=$AZURE_USERNAME -PazPassword=$AZURE_PASSWORD "-PaccountCredFile=$GCP_ACCOUNT_CRED_FILE" $EXTRA
