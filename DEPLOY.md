# Deployment Guide for Veiligstallen App

This guide explains how to deploy the Veiligstallen application on a Digital Ocean VPS using GitHub Actions for continuous deployment.

## Prerequisites

1. A Digital Ocean account
2. A GitHub repository with the application code
3. Docker installed on your local machine (for testing)
4. SSH access to your Digital Ocean droplet

## Initial Server Setup

1. Create a new Digital Ocean Droplet:

   - Choose Ubuntu 22.04 LTS
   - Select a plan that meets your needs (recommended: Basic plan with 2GB RAM)
   - Choose a datacenter region close to your target users
   - Add your SSH key
   - Create the droplet

2. Initial server configuration:

   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade -y

   # Install Docker
   sudo apt install -y docker.io docker-compose

   # Add your user to the docker group
   sudo usermod -aG docker $USER

   # Install Nginx
   sudo apt install -y nginx

   # Configure firewall
   sudo ufw allow ssh
   sudo ufw allow 22/tcp
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

## GitHub Actions Setup

1. The github action workflow is checked in with the project: see the .github/deploy-veiligstallen-work.yaml file

2. Go to your GitHub repository
3. Navigate to Settings → Secrets and variables → Actions

4. Set up the following Repository Variables (not secrets):
   - `NEXT_PUBLIC_API_BASE_URL`: Your API base URL (e.g., https://veiligstallen.work)
   - `NEXT_PUBLIC_WEB_BASE_URL`: Your web base URL (e.g., https://veiligstallen.work)
   - `NEXTAUTH_URL`: Your NextAuth URL (e.g., https://veiligstallen.work)
   - `DROPLET_HOST`: Your Digital Ocean droplet IP address or base URL
   - `DROPLET_USERNAME`: SSH username for the droplet

5. Set up the following Repository Secrets:
   - `DATABASE_URL`: MySQL database URL (e.g., mysql://user:pass@127.0.0.1:5555/veiligstallen)
   - `DROPLET_SSH_KEY`: Your SSH private key for deployment
   - `NEXTAUTH_SECRET`: A secure random string for NextAuth (generate with: openssl rand -base64 32)
   - `NEXT_PUBLIC_MAPBOX_TOKEN`: Your Mapbox API token
   - `LOGINTOKEN_SIGNER_PRIVATE_KEY`: Private key for signing login tokens (generate with: openssl rand -hex 32)

To generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

To generate a LOGINTOKEN_SIGNER_PRIVATE_KEY:
```bash
openssl rand -hex 32
```

See section **Creating the SSH Key for Deployment** below for setting up the DROPLET_SSH_KEY

Note: Keep your secrets secure and never commit them to the repository. The variables are less sensitive and can be viewed by repository collaborators, while secrets are encrypted and only visible during workflow execution.

## Server Configuration

1. Create the application directory and clone the repository:

   ```bash
   sudo mkdir -p /var/www/veiligstallen
   sudo chown $USER:$USER /var/www/veiligstallen
   cd /var/www/veiligstallen
   git clone https://github.com/your-username/veiligstallen.git .
   git checkout veiligstallen-v2
   ```

2. Create a `.env` file in `/var/www/veiligstallen`:

   ```bash
   sudo nano /var/www/veiligstallen/.env
   ```

   Add the following configuration (adjust values as needed):

   ```env
   # Database configuration
   DATABASE_URL=mysql://username:password@localhost:3306/veiligstallen

   # Other environment variables from your local .env file
   # Make sure to update any URLs to use the production domain
   ```

3. Create a `docker-compose.yml` file in `/var/www/veiligstallen`:

   ```yaml
   version: "3"
   services:
     app:
       image: your-dockerhub-username/veiligstallen:latest
       restart: always
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
       env_file:
         - .env
       # Add network configuration to connect to host's localhost
       network_mode: "host"
   ```

4. Configure Nginx as a reverse proxy:

   ```bash
   sudo nano /etc/nginx/sites-available/veiligstallen
   ```

   Add the following configuration:

   ```nginx
   server {
       listen 80;
       server_name veiligstallen.work www.veiligstallen.work;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable the site:

   ```bash
   sudo ln -s /etc/nginx/sites-available/veiligstallen /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## SSL Configuration

1. Install Certbot and Nginx plugin:

   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. Update Nginx configuration to include both domains:

   ```bash
   sudo nano /etc/nginx/sites-available/veiligstallen
   ```

   Add the following configuration:

   ```nginx
   server {
       listen 80;
       server_name veiligstallen.work www.veiligstallen.work;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Obtain and configure SSL certificate:

   ```bash
   # Get SSL certificate for both domains
   sudo certbot --nginx -d veiligstallen.work -d www.veiligstallen.work

   # Verify the certificate auto-renewal is set up
   sudo certbot renew --dry-run
   ```

4. Set up automatic renewal (Certbot creates a systemd timer by default, but verify it's active):
   ```bash
   sudo systemctl status certbot.timer
   ```

The SSL certificate will automatically renew when it's close to expiration (Let's Encrypt certificates are valid for 90 days).

## Deployment Process

1. Push changes to the `veiligstallen-v2` branch
2. GitHub Actions will automatically:
   - Build the Docker image
   - Push it to Docker Hub
   - Deploy it to your Digital Ocean droplet

## Monitoring and Maintenance

1. View application logs:

   ```bash
   docker-compose logs -f
   ```

2. Monitor system resources:

   ```bash
   htop
   ```

3. Update the application:
   - Simply push changes to the `veiligstallen-v2` branch
   - GitHub Actions will handle the deployment

## Troubleshooting

1. If the application fails to start:

   ```bash
   docker-compose logs
   ```

2. If Nginx is not serving the application:

   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

3. Check system resources:
   ```bash
   df -h
   free -m
   ```

## Backup Strategy

1. Regular database backups (if applicable)
2. Configuration file backups
3. Docker volume backups

## Security Considerations

1. Keep the system updated:

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. Regularly rotate SSH keys and Docker Hub tokens
3. Monitor system logs for suspicious activity
4. Keep Docker images updated with security patches

For any issues or questions, please contact the development team.

## Database Setup

1. Install MySQL on the droplet:

   ```bash
   sudo apt install -y mysql-server
   sudo mysql_secure_installation
   ```

2. Create the database and user:

   ```bash
   sudo mysql
   ```

   ```sql
   CREATE DATABASE veiligstallen;
   CREATE USER 'username'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON veiligstallen.* TO 'username'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. Verify MySQL is configured for local-only connections:

   ```bash
   sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
   ```

   Ensure the `bind-address` line is set to:

   ```
   bind-address = 127.0.0.1
   ```

   Restart MySQL:

   ```bash
   sudo systemctl restart mysql
   ```

Note: The database is configured to only accept local connections. To access the database remotely, you'll need to SSH into the server first. This is a security best practice that prevents direct remote access to the database.

4. Allow MySQL through the firewall:
   ```bash
   sudo ufw allow 3306/tcp
   ```

## Alternative Deployment Method (Local Build)

If you don't have access to GitHub repository secrets, you can deploy directly from your local machine. This method involves building the Docker image locally and transferring it to the VPS.

1. Build the Docker image locally:

   ```bash
   # From your local project directory
   docker build \
     --build-arg NEXT_PUBLIC_API_BASE_URL="$(grep NEXT_PUBLIC_API_BASE_URL .env | cut -d '=' -f2)" \
     --build-arg NEXT_PUBLIC_WEB_BASE_URL="$(grep NEXT_PUBLIC_WEB_BASE_URL .env | cut -d '=' -f2)" \
     --build-arg DATABASE_URL="$(grep DATABASE_URL .env | cut -d '=' -f2)" \
     --build-arg NEXTAUTH_SECRET="$(grep NEXTAUTH_SECRET .env | cut -d '=' -f2)" \
     --build-arg NEXTAUTH_URL="$(grep NEXTAUTH_URL .env | cut -d '=' -f2)" \
     --build-arg NEXT_PUBLIC_MAPBOX_TOKEN="$(grep NEXT_PUBLIC_MAPBOX_TOKEN .env | cut -d '=' -f2)" \
     --build-arg LOGINTOKEN_SIGNER_PRIVATE_KEY="$(grep LOGINTOKEN_SIGNER_PRIVATE_KEY .env | cut -d '=' -f2)" \
     -t veiligstallen:latest .
   ```

   Or, if you prefer to read directly from your .env file:

   ```bash
   # Create a script to read .env and build
   cat > build.sh << 'EOL'
   #!/bin/bash
   set -a
   source .env
   set +a

   docker build \
     --build-arg NEXT_PUBLIC_API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL" \
     --build-arg NEXT_PUBLIC_WEB_BASE_URL="$NEXT_PUBLIC_WEB_BASE_URL" \
     --build-arg DATABASE_URL="$DATABASE_URL" \
     --build-arg NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
     --build-arg NEXTAUTH_URL="$NEXTAUTH_URL" \
     --build-arg NEXT_PUBLIC_MAPBOX_TOKEN="$NEXT_PUBLIC_MAPBOX_TOKEN" \
     --build-arg LOGINTOKEN_SIGNER_PRIVATE_KEY="$LOGINTOKEN_SIGNER_PRIVATE_KEY" \
     -t veiligstallen:latest .
   EOL

   chmod +x build.sh
   ./build.sh
   ```

2. Save the Docker image to a file:

   ```bash
   docker save veiligstallen:latest > veiligstallen.tar
   ```

3. Transfer the image to the VPS:

   ```bash
   scp veiligstallen.tar user@your-droplet-ip:/var/www/veiligstallen/
   ```

4. SSH into the VPS and load the image:

   ```bash
   ssh user@your-droplet-ip
   cd /var/www/veiligstallen
   docker load < veiligstallen.tar
   ```

5. Update the docker-compose.yml file if needed:

   ```bash
   # Edit the image name in docker-compose.yml to use the local image
   nano docker-compose.yml
   ```

   ```yaml
   version: "3"
   services:
     app:
       image: veiligstallen:latest # Use the local image name
       restart: always
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
       env_file:
         - .env
       network_mode: "host"
   ```

6. Restart the containers:

   ```bash
   docker-compose down
   docker-compose up -d
   ```

7. Clean up the transferred image file:
   ```bash
   rm veiligstallen.tar
   ```

To deploy updates:

1. Make your changes locally
2. Build a new image
3. Repeat steps 2-6 above

Note: This method requires:

- Docker installed on your local machine
- SSH access to the VPS
- Sufficient disk space on both local machine and VPS for the Docker image
- Manual execution of deployment steps

## Creating the SSH Key for Deployment

1. Generate a new SSH key pair on your local machine:

   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/veiligstallen_deploy
   ```

   - When prompted for a passphrase, you can leave it empty for automated deployments
   - This will create two files:
     - `~/.ssh/veiligstallen_deploy` (private key)
     - `~/.ssh/veiligstallen_deploy.pub` (public key)

2. Add the public key to your Digital Ocean droplet:

   - Copy the contents of the public key:

   ```bash
   cat ~/.ssh/veiligstallen_deploy.pub
   ```

   - SSH into your droplet
   - Add the public key to `~/.ssh/authorized_keys`:

   ```bash
   echo "your_public_key_content" >> ~/.ssh/authorized_keys
   ```

3. For the GitHub secret:

   - Copy the entire contents of the private key:

   ```bash
   cat ~/.ssh/veiligstallen_deploy
   ```

   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Create a new repository secret named `DROPLET_SSH_KEY`
   - Paste the entire private key content, including:
     - The `-----BEGIN OPENSSH PRIVATE KEY-----` line
     - All the key content
     - The `-----END OPENSSH PRIVATE KEY-----` line

4. Set proper permissions for the private key:

   ```bash
   chmod 600 ~/.ssh/veiligstallen_deploy
   ```

5. Test the connection:
   ```bash
   ssh -i ~/.ssh/veiligstallen_deploy your_username@your_droplet_ip
   ```

Important security notes:

- Never share your private key
- Keep the private key file secure on your local machine
- Make sure to use a unique key pair for each deployment
- Consider using a passphrase if you need additional security