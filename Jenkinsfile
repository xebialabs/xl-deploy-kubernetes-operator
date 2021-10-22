pipeline{
    agent none
    parameters {
        choice(name: 'PRODUCT', choices: ['XL Release', 'XL Deploy'], description: 'Select the product to package')
        choice(name: 'PUSH_TO_NEXUS', choices: ['NO', 'YES'], description: 'Do you want to push the zip file to nexus?')
        choice(name: 'PUSH_TO_NEXUS_TO_XEBIALABS_DIST', choices: ['NO', 'YES'], description: 'Do you want to push the zip file to nexus to xebialans dist server?')        
    }
    environment {
        NEXUS_VERSION = "nexus3"
        NEXUS_PROTOCOL = "http"
        NEXUS_PASSWORD = credentials('nexus-ci')
        XEBIA_DIST_PASSWORD = credentials('16717ee9-bee2-4eb4-ab9e-022ff33a75ef')
        GitHubUser= credentials('XebiaLabsCIGithubToken')
        NEXUS_URL= 'https://nexus.xebialabs.com/nexus/content/repositories/releases/com/xebialabs/operator-based-installer'
    }
    stages {
        stage('Git clone and zip') {
            when {
                anyOf {
                    expression { params.PRODUCT == 'XL Deploy' }
                    expression { params.PRODUCT == 'XL Release'}
                }
            }
            agent {
                node {
                    label "xlp-helm"
            }
            }
            steps {
                step([$class: 'WsCleanup'])
                script {     
                    if ( params.PRODUCT == 'XL Release' ) {                    
                            sh "git clone http://$GitHubUser_USR:$GitHubUser_PSW@github.com/xebialabs/xl-release-kubernetes-operator.git"     
                            dir("xl-release-kubernetes-operator") {
                                sh 'for r in */; do zip -r "${r%/}.zip" "$r"; done'
                                sh "ls -lah"
                            }
                            echo "Git check out successful !!!"
                       
                    }else {
                            sh "git clone http://$GitHubUser_USR:$GitHubUser_PSW@github.com/xebialabs/xl-deploy-kubernetes-operator.git"     
                            dir("xl-deploy-kubernetes-operator") {
                                sh 'for r in */; do zip -r "${r%/}.zip" "$r"; done'
                                sh "ls -lah"
                            }
                            echo "Git check out successful !!!"
                     
                    }                                      
                }
            }
        }
        stage('Push to Nexus repository') {
            when {
                anyOf {
                    expression { params.PUSH_TO_NEXUS == 'YES' && params.PRODUCT == 'XL Deploy' }
                    expression { params.PUSH_TO_NEXUS == 'YES' && params.PRODUCT == 'XL Release'}
                }
            }
            agent {
                node {
                    label "xlp-helm"
            }
            }
            steps {
                script {     
                    if ( params.PRODUCT == 'XL Release' ) {
                            dir("xl-release-kubernetes-operator") {
                                 echo "Pushing nexus build to nexus"
                                sh  'curl -v -k -u ${NEXUS_PASSWORD} --upload-file release-operator-aws-ek*.zip ${NEXUS_URL}/Release/'
                                sh  'curl -v -k -u ${NEXUS_PASSWORD} --upload-file release-operator-az*.zip ${NEXUS_URL}/Release/'
                                sh  'curl -v -k -u ${NEXUS_PASSWORD} --upload-file release-operator-open*.zip ${NEXUS_URL}/Release/'
                                echo "Push successful"
                            }
                           
                    }else {
                            dir("xl-deploy-kubernetes-operator") {
                                echo "Pushing nexus build to nexus"
                                sh  'curl -v -k -u ${NEXUS_PASSWORD} --upload-file deploy-operator-aws-ek*.zip ${NEXUS_URL}/Deploy/'
                                sh  'curl -v -k -u ${NEXUS_PASSWORD} --upload-file deploy-operator-az*.zip ${NEXUS_URL}/Deploy/'
                                sh  'curl -v -k -u ${NEXUS_PASSWORD} --upload-file deploy-operator-open*.zip ${NEXUS_URL}/Deploy/'
                                echo "Push successful"
                            }
                    }                                      
                }
            }
        }
        stage('Nexus to dist server') {
            when {
                anyOf {
                    expression { params.PUSH_TO_NEXUS_TO_XEBIALABS_DIST == 'YES' && params.PRODUCT == 'XL Deploy' }
                    expression { params.PUSH_TO_NEXUS_TO_XEBIALABS_DIST == 'YES' && params.PRODUCT == 'XL Release'}
                   
                }
            }
            agent {
                node {
                    label "xlp-helm"
            }
            }
            steps {
                script { 
                     if ( params.PRODUCT == 'XL Release' ) {
                        dir("xl-release-kubernetes-operator") {
                           echo "Pushing Nexus build to xebialabs distribution"
                           sh "ssh xebialabs@nexus1.xebialabs.cyso.net rsync --update -raz -i --include='release-operator-aws-eks.zip' --include='release-operator-azure-aks.zip' --include='release-operator-openshift.zip' --exclude='*'  /opt/sonatype-work/nexus/storage/releases/com/xebialabs/operator-based-installer/Release/ xldown@dist.xebialabs.com:/var/www/dist.xebialabs.com/customer/operator/release"
                         }
                    }else {
                            dir("xl-deploy-kubernetes-operator") {
                            echo "Pushing Nexus build to xebialabs distribution"
                            sh "ssh xebialabs@nexus1.xebialabs.cyso.net rsync --update -raz -i --include='deploy-operator-aws-eks.zip' --include='deploy-operator-azure-aks.zip' --include='deploy-operator-openshift.zip' --exclude='*' /opt/sonatype-work/nexus/storage/releases/com/xebialabs/operator-based-installer/Deploy/ xldown@dist.xebialabs.com:/var/www/dist.xebialabs.com/customer/operator/deploy"

                        }
                    }
                            
                       
                }
            }
        }
    }
}
