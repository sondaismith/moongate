def remote=[:]
remote.name = 'droplet'
remote.host = '138.197.71.223'
remote.knownHosts = '/var/lib/jenkins/.ssh/known_hosts'

pipeline {
    agent any
    tools {nodejs "personal-laptop-nodejs-version"}
    parameters{
        booleanParam(name: 'skip_dependencies', defaultValue: true, description:'Set to true to skip installation of dependencies')
    }
    stages {
        stage('Get application code + Install dependencies') {
            when {expression {params.skip_dependencies != true} }
            steps {
                checkout scmGit(
                    branches: [[name: 'dev']],
                    userRemoteConfigs: [[credentialsId:'moongate-repo-PAT',
                        url: 'https://github.com/sondaismith/moongate.git'
                    ]]
                )
                // Install dependencies
                sh 'npm ci'
            }
        }
        stage('Test application'){
            when {expression {params.skip_dependencies != true} }
            steps{
                sh 'npm run test'
            }
        }
        // stage('Build application'){
        //     when {expression {params.skip_dependencies != true} }
        //     steps{
        //         sh 'npm run build'
        //     }
        // }
        stage('Attempt to connect to deployment Droplet via SSH') {
            steps {
                sh 'cd /var/jenkins_home/workspace/build-and-test/ && ls -la'
                withCredentials([sshUserPrivateKey(credentialsId: 'd620c8bd-fb76-4a89-afaf-6ec15ac789f6	', keyFileVariable: 'identity', passphraseVariable: '', usernameVariable: 'root')]) {
                    script{
                        remote.user = 'root'
                        remote.identityFile = identity
                    }
                    sh "echo 'Navigating to SSH Deployment folder'"
                    sshCommand(remote: remote, command: "cd /var/www/html && pwd")
                    sh "echo 'Displaying contents of Deployment folder - moon/dist'"
                    sshCommand(remote: remote, command: "ls -la /var/www/html/moon/dist")
                }
            }
        }
    }
}