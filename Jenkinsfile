pipeline{
    agent {
        label "master"
    }
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
    }
    stages {
        /*stage("Git clone and zip") {
            steps {
                //sh "git clone http://$GitHubUser_USR:$GitHubUser_PSW@github.com/xebialabs/xl-deploy-kubernetes-operator.git"     
                sh cp ../Deploy*.zip ${JENKINS_WDIR}
                }
                
            }*/
        
        /*stage('Push to Nexus repository') {
            when {
                anyOf {
                    expression { params.PUSH_TO_NEXUS == 'YES' && params.PRODUCT == 'XL Deploy' }
                    expression { params.PUSH_TO_NEXUS == 'YES' && params.PRODUCT == 'XL Release'}
                }
            }
            steps {
                script {     
                    if ( params.PRODUCT == 'XL Release' ) {
                        try {
                            echo "Pushing nexus build to nexus"
                            sh  "curl -v -k -u ${NEXUS_CREDENTIAL_ID} --upload-file Release*.zip ${NEXUS_URL}"
                                echo "Push successful"
                        }catch(error){
                            throw error
                        }
                    }else {
                        try {
                            echo "Pushing nexus build to nexus"
                            sh "curl -v -k -u ${NEXUS_CREDENTIAL_ID} --upload-file Deploy*.zip ${NEXUS_URL}"
                                echo "Push successful"
                        }catch(error){
                            throw error
                        }
                    }                                      
                }
            }
        }*/
        stage('Nexus to dist server') {
            when {
                anyOf {
                    expression { params.PUSH_TO_XEBIALABS_DIST == 'YES' && params.PRODUCT == 'XL Deploy' }
                    expression { params.PUSH_TO_XEBIALABS_DIST == 'YES' && params.PRODUCT == 'XL Release'}
                   
                }
            }
            steps {
                script { 
                     if ( params.PRODUCT == 'XL Release' ) {
                        try {
                            
                            echo "Pushing Nexus build to xebialabs distribution"
                           sh "ssh xebialabs@nexus1.xebialabs.cyso.net rsync --update -raz -i --exclude '*operator*.zip' --exclude .htaccess --exclude '*.xml' /opt/sonatype-work/nexus/storage/operator/deploy xldown@dist.xebialabs.com:/var/www/dist.xebialabs.com/customer/operator/release"
                        
                        }catch(error) {
                            throw error
                        }
                    }else {
                        try {

                            echo "Pushing Nexus build to xebialabs distribution"
                            "ssh xebialabs@nexus1.xebialabs.cyso.net rsync --update -raz -i --exclude '*operator*.zip' --exclude .htaccess --exclude '*.xml' /opt/sonatype-work/nexus/storage/operator/release xldown@dist.xebialabs.com:/var/www/dist.xebialabs.com/customer/operator/deploy"
                            
                        }catch(error) {
                            throw error
                        }
                    }
                            
                       
                }
            }
        }
    }
}
