def remote=[:]
remote.name = 'droplet'
remote.host = '138.197.71.223'
remote.knownHosts = '/var/lib/jenkins/.ssh/known_hosts'

pipeline {
    agent any
    tools {nodejs "personal-desktop-nodejs-version"}
    parameters{
        booleanParam(name: 'skip_dependencies', defaultValue: false, description:'Set to true to skip installation of dependencies')
    }
    triggers{pollSCM 'H/10 * * * *'}
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
        stage('Build application'){
            when {expression {params.skip_dependencies != true} }
            steps{
                sh 'npm run build-web'
            }
        }
        stage('Attempt to connect to deployment Droplet via SSH') {
            steps {
                sh 'cd /var/jenkins_home/workspace/build-and-test/ && ls -la'
                withCredentials([sshUserPrivateKey(credentialsId: 'd620c8bd-fb76-4a89-afaf-6ec15ac789f6	', keyFileVariable: 'identity', passphraseVariable: '', usernameVariable: 'userName')]) {
                    script{
                        remote.user = userName
                        remote.identityFile = identity
                        remote.logLevel = "FINEST"
                    }
                    // sh "echo 'Navigating to SSH Deployment folder'"
                    // sshCommand remote: remote, command: "cd /var/www/html && pwd"
                    // sh "echo 'Displaying contents of Deployment folder - moon/dist'"
                    // sshCommand remote: remote, command: "ls -la /var/www/html/moon/dist", failOnError: false
                    // sh "echo 'Displaying contents of Deployment folder assets - moon/dist/assets'"
                    // sshCommand remote: remote, command: "ls -la /var/www/html/moon/dist/assets", failOnError: false
                    sh "echo 'Stop website server'"
                    sshCommand remote: remote, command: "cd /var/www/html && sudo -u nodejs pm2 delete all", failOnError: false
                    sh "echo 'Delete existing website app files (clear large .js files)'"
                    sshCommand remote: remote, command: "rm -r /var/www/html/moon/dist/assets/", failOnError: false
                    sh "echo 'Copying built app to remote server'"
                    sshPut remote: remote, from: '/var/jenkins_home/workspace/build-and-test/dist/', into: '/var/www/html/moon'
                    // sh 'scp -r -i ${identity} /var/jenkins_home/workspace/build-and-test/dist ${remote.user}@${remote.host}:/var/www/html/moon'
                    sh "echo 'Restart website'"
                    sshCommand(remote: remote, command: "cd /var/www/html/ && sudo -u nodejs pm2 start ecosystem.config.js")
                }
            }
        }
    }
}