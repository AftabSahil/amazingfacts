resource "aws_instance" "web_server" {

  ami           = "ami-0f58b397bc5c1f2e8"
  instance_type = "t2.micro"

  key_name = "terraform-key"

  subnet_id = aws_subnet.public_subnet.id

  vpc_security_group_ids = [aws_security_group.web_sg.id]

  user_data = <<-EOF
#!/bin/bash
sudo apt update -y
sudo apt install docker.io -y
sudo systemctl start docker
sudo docker run -d -p 80:80 alexdocker159/amazingfacts:latest
EOF

  tags = {
    Name = "amazingfacts-server"
  }

}