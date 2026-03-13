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
                cd terraform && terraform init
                '''
            }
        }
        stage('Terraform Apply') {
            steps {
                sh '''
                cd terraform && terraform apply -auto-approve
                '''
            }
        }
        stage('Run Container on EC2') {
            steps {
                withCredentials([sshUserPrivateKey(
                credentialsId: 'ec2-key',
                keyFileVariable: 'SSH_KEY',
                usernameVariable: 'SSH_USER'
                )]) {
                    sh '''
                    EC2_IP=$(cd terraform && terraform output -raw ec2_public_ip)
                    
                    echo "Waiting for EC2 to be ready..."
                    sleep 60

                    ssh -i $SSH_KEY -o StrictHostKeyChecking=no $SSH_USER@$EC2_IP "
                        sudo docker stop \$(sudo docker ps -q) 2>/dev/null || true
                        sudo docker rm \$(sudo docker ps -aq) 2>/dev/null || true
                        sudo docker run -d -p 80:80 alexdocker159/amazingfacts:latest
                    "
                    '''
                }
            }
        }
    }
}