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
                    echo $DOCKER_PASSWORD | /usr/local/bin/docker login -u $DOCKER_USERNAME --password-stdin
                    '''
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                withCredentials([
                    string(credentialsId: 'supabase-url', variable: 'SUPABASE_URL'),
                    string(credentialsId: 'supabase-key', variable: 'SUPABASE_KEY')
                ]) {
                    sh '''
                    /usr/local/bin/docker buildx build \
                    --platform linux/amd64 \
                    --build-arg REACT_APP_SUPABASE_URL=$SUPABASE_URL \
                    --build-arg REACT_APP_SUPABASE_ANON_KEY=$SUPABASE_KEY \
                    -t alexdocker159/amazingfacts:latest \
                    --push .
                    '''
                }
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

                    echo "Waiting for SSH to be available..."
                    for i in $(seq 1 30); do
                        ssh -i $SSH_KEY -o StrictHostKeyChecking=no -o ConnectTimeout=5 $SSH_USER@$EC2_IP "echo ready" && break
                        echo "Attempt $i failed, retrying in 15s..."
                        sleep 15
                    done

                    echo "Waiting for Docker to be ready..."
                    ssh -i $SSH_KEY -o StrictHostKeyChecking=no $SSH_USER@$EC2_IP \
                        "until /usr/bin/docker info > /dev/null 2>&1; do echo 'Waiting for Docker...'; sleep 5; done"

                    echo "Deploying container..."
                        ssh -i $SSH_KEY -o StrictHostKeyChecking=no $SSH_USER@$EC2_IP \
                        "sudo /usr/bin/docker stop \$(sudo /usr/bin/docker ps -q) 2>/dev/null; \
                        sudo /usr/bin/docker rm \$(sudo /usr/bin/docker ps -aq) 2>/dev/null; \
                        sudo /usr/bin/docker pull alexdocker159/amazingfacts:latest; \
                        sudo /usr/bin/docker run -d -p 80:80 alexdocker159/amazingfacts:latest"
                    '''
                }
            }
        }
    }
    post {
        success {
            echo "✅ Deployment successful!"
            sh '''
            EC2_IP=$(cd terraform && terraform output -raw ec2_public_ip)
            echo "App is live at: http://$EC2_IP"
            '''
        }
        failure {
            echo "❌ Pipeline failed. Check logs above."
        }
    }
}