pipeline {
    agent any
    environment {
        IMAGE_NAME = "alexdocker159/amazingfacts"
    }
    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }
        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USERNAME',
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {
                    sh '''
                    echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
                    '''
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                sh '''
                docker buildx build \
                --platform linux/amd64 \
                -t alexdocker159/amazingfacts:latest \
                --push .
                '''
            }
        }
        stage('Terraform Init') {
            steps {
                sh '''
                cd terraform
                terraform init
                '''
            }
        }
        stage('Terraform Apply') {
            steps {
                sh '''
                cd terraform
                terraform apply -auto-approve
                '''
            }
        }  // ← this closing brace was missing!
        stage('Run Container on EC2') {
            steps {
                sshagent(credentials: ['ec2-key']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no ubuntu@$(terraform output -raw ec2_public_ip) \
                    "sudo docker run -d -p 80:80 alexdocker159/amazingfacts:latest"
                    '''
                }
            }
        }
    }
}