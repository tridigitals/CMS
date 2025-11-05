# Deployment Guide

## Overview

Deployment guide untuk ISP Management System dengan Laravel + React stack. Guide ini mencakup setup development, staging, dan production environment.

## System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **PHP**: 8.1+
- **Node.js**: 16+
- **MySQL**: 8.0+ / PostgreSQL 13+
- **Redis**: 6+

### Recommended Requirements
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **OS**: Ubuntu 22.04 LTS
- **PHP**: 8.2+
- **Node.js**: 18+
- **MySQL**: 8.0+
- **Redis**: 7+
- **Nginx**: 1.20+

## Environment Setup

### Development Environment

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y git curl wget unzip software-properties-common

# Install PHP 8.2
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip php8.2-bcmath php8.2-gd php8.2-intl php8.2-sqlite3 php8.2-tokenizer php8.2-dom

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# Install Nginx
sudo apt install -y nginx

# Install MySQL
sudo apt install -y mysql-server

# Install Redis
sudo apt install -y redis-server

# Install PM2
sudo npm install -g pm2
```

#### 2. Application Setup
```bash
# Clone repository
git clone https://github.com/your-org/isp-management.git
cd isp-management

# Install PHP dependencies
composer install --optimize-autoloader --no-dev

# Install Node.js dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Link storage
php artisan storage:link

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### 3. Nginx Configuration
```nginx
# /etc/nginx/sites-available/isp-management
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/isp-management/public;
    index index.php index.html;

    client_max_body_size 100M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}
```

### Staging Environment

#### 1. Server Configuration
```bash
# Create staging user
sudo adduser staging
sudo usermod -aG sudo staging

# Setup directory structure
sudo mkdir -p /var/www/staging
sudo chown staging:staging /var/www/staging

# Clone repository
cd /var/www/staging
sudo -u staging git clone https://github.com/your-org/isp-management.git .

# Setup environment
sudo -u staging cp .env.example .env.staging
sudo -u staging nano .env.staging
```

#### 2. Staging Environment Variables
```env
# .env.staging
APP_NAME="ISP Management System"
APP_ENV=staging
APP_KEY=base64:your_staging_app_key
APP_DEBUG=false
APP_URL=https://staging.your-domain.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=isp_management_staging
DB_USERNAME=staging_user
DB_PASSWORD=staging_password

BROADCAST_DRIVER=log
CACHE_DRIVER=redis
FILESYSTEM_DISK=local
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="staging@your-domain.com"

# Payment Gateway (Staging)
MIDTRANS_SERVER_KEY=your_staging_midtrans_key
MIDTRANS_CLIENT_KEY=your_staging_midtrans_client_key
MIDTRANS_IS_PRODUCTION=false

TRIPAY_API_KEY=your_staging_tripay_key
TRIPAY_PRIVATE_KEY=your_staging_tripay_private_key
TRIPAY_MERCHANT_CODE=your_staging_merchant_code
TRIPAY_IS_PRODUCTION=false

# Geniacs Integration
GENIACS_API_KEY=your_staging_geniacs_key
GENIACS_API_SECRET=your_staging_geniacs_secret
GENIACS_WEBHOOK_SECRET=your_staging_webhook_secret
```

### Production Environment

#### 1. Server Configuration
```bash
# Create production user
sudo adduser production
sudo usermod -aG sudo production

# Setup directory structure
sudo mkdir -p /var/www/production
sudo chown production:production /var/www/production

# Clone repository with deployment key
cd /var/www/production
sudo -u production git clone https://github.com/your-org/isp-management.git .

# Setup environment
sudo -u production cp .env.example .env.production
sudo -u production nano .env.production
```

#### 2. Production Environment Variables
```env
# .env.production
APP_NAME="ISP Management System"
APP_ENV=production
APP_KEY=base64:your_production_app_key
APP_DEBUG=false
APP_URL=https://your-domain.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=isp_management_production
DB_USERNAME=production_user
DB_PASSWORD=secure_production_password

BROADCAST_DRIVER=log
CACHE_DRIVER=redis
FILESYSTEM_DISK=local
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=secure_redis_password
REDIS_PORT=6379

# SSL Configuration
FORCE_HTTPS=true

# Payment Gateway (Production)
MIDTRANS_SERVER_KEY=your_production_midtrans_key
MIDTRANS_CLIENT_KEY=your_production_midtrans_client_key
MIDTRANS_IS_PRODUCTION=true

TRIPAY_API_KEY=your_production_tripay_key
TRIPAY_PRIVATE_KEY=your_production_tripay_private_key
TRIPAY_MERCHANT_CODE=your_production_merchant_code
TRIPAY_IS_PRODUCTION=true

# Geniacs Integration
GENIACS_API_KEY=your_production_geniacs_key
GENIACS_API_SECRET=your_production_geniacs_secret
GENIACS_WEBHOOK_SECRET=your_production_webhook_secret

# Security
ENCRYPTION_KEY=your_32_character_encryption_key
API_RATE_LIMIT=1000

# Performance
OPCACHE_ENABLE=true
OPCACHE_CACHE_TIME=3600
```

## SSL Configuration

### Let's Encrypt Setup
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet --nginx
```

### Nginx SSL Configuration
```nginx
# /etc/nginx/sites-available/isp-management-ssl
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    root /var/www/production/public;
    index index.php index.html;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA512:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-SHA512;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    client_max_body_size 100M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_param HTTPS on;
    }

    location ~ /\.ht {
        deny all;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Database Configuration

### MySQL Configuration
```ini
# /etc/mysql/mysql.conf
[mysqld]
# Basic settings
datadir = /var/lib/mysql
socket = /var/run/mysqld/mysqld.sock
pid-file = /var/run/mysqld/mysqld.pid
user = mysql
bind-address = 127.0.0.1
port = 3306

# Performance settings
innodb_buffer_pool_size = 256M
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 1
innodb_flush_method = O_DIRECT
innodb_lock_wait_timeout = 50
innodb_file_per_table = 1

# Connection settings
max_connections = 200
max_connect_errors = 1000
wait_timeout = 60
interactive_timeout = 60

# Query cache
query_cache_type = 1
query_cache_size = 64M
query_cache_limit = 2M

# Logging
log_error = /var/log/mysql/error.log
slow_query_log = /var/log/mysql/slow.log
long_query_time = 2

# Character set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

[mysql]
default-character-set = utf8mb4
```

### Redis Configuration
```conf
# /etc/redis/redis.conf
# Basic settings
bind 127.0.0.1
port 6379
timeout 0
tcp-keepalive 300

# Memory settings
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log

# Security
requirepass your_redis_password
```

## Process Management

### Supervisor Configuration
```ini
# /etc/supervisor/conf.d/isp-management-worker.conf
[program:isp-worker]
process_name=%(program_name)s
command=php /var/www/production/artisan queue:work --sleep=1 --tries=3 --max-time=3600
directory=/var/www/production
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/supervisor/isp-worker.log
stopwaitsecs=3600

[program:isp-scheduler]
process_name=%(program_name)s
command=php /var/www/production/artisan schedule:run
directory=/var/www/production
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/supervisor/isp-scheduler.log
stopwaitsecs=3600

[program:isp-websocket]
process_name=%(program_name)s
command=php /var/www/production/artisan websockets:serve
directory=/var/www/production
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/supervisor/isp-websocket.log
stopwaitsecs=3600
```

### PM2 Configuration (Alternative)
```json
{
  "name": "isp-management",
  "script": "npm run build",
  "instances": 1,
  "autorestart": true,
  "watch": false,
  "max_memory_restart": "1G",
  "env": {
    "NODE_ENV": "production"
  },
  "log_file": "/var/log/pm2/isp-management.log",
  "error_file": "/var/log/pm2/isp-management-error.log",
  "out_file": "/var/log/pm2/isp-management-out.log"
}
```

## Monitoring Setup

### Laravel Telescope
```bash
# Install Telescope (development only)
composer require laravel/telescope --dev

# Publish Telescope assets
php artisan vendor:publish --tag=telescope-assets

# Run migrations
php artisan migrate
```

### Laravel Horizon
```bash
# Install Horizon
composer require laravel/horizon

# Publish Horizon assets
php artisan vendor:publish --tag=horizon-assets

# Run migrations
php artisan migrate

# Install Horizon dashboard
npm install --prefix=vendor/laravel/horizon
npm run build
```

### System Monitoring
```bash
# Install Netdata
bash <(curl -sS https://my-netdata.io/kickstart.sh)

# Install Node Exporter for Prometheus
docker run -d -p 9100:9100 \
  --name="node-exporter" \
  --restart="always" \
  prom/node-exporter

# Install Prometheus
docker run -d -p 9090:9090 \
  --name="prometheus" \
  --restart="always" \
  prom/prometheus \
  --config.file=/path/to/prometheus.yml
```

## Backup Strategy

### Database Backup
```bash
#!/bin/bash
# /scripts/backup-database.sh

BACKUP_DIR="/var/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="isp_management_production"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
mysqldump --single-transaction --routines --triggers \
  --host=127.0.0.1 --username=production_user \
  --password=$DB_PASSWORD $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Remove backups older than 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Database backup completed: db_backup_$DATE.sql.gz"
```

### Application Backup
```bash
#!/bin/bash
# /scripts/backup-application.sh

BACKUP_DIR="/var/backups/application"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/production"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz \
  --exclude=node_modules \
  --exclude=storage/app/* \
  --exclude=storage/logs \
  --exclude=bootstrap/cache \
  --exclude=storage/framework/cache \
  --exclude=storage/framework/sessions \
  --exclude=storage/framework/views \
  $APP_DIR

# Backup storage directory
tar -czf $BACKUP_DIR/storage_backup_$DATE.tar.gz \
  $APP_DIR/storage

# Remove backups older than 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Application backup completed"
```

### Cron Jobs
```bash
# Edit crontab
sudo crontab -e

# Database backup (daily at 2 AM)
0 2 * * * /scripts/backup-database.sh

# Application backup (daily at 3 AM)
0 3 * * * /scripts/backup-application.sh

# Clear application cache (every 6 hours)
0 */6 * * * cd /var/www/production && php artisan cache:clear

# Optimize application (weekly on Sunday at 4 AM)
0 4 * * 0 cd /var/www/production && php artisan config:cache

# Log rotation (monthly)
0 0 1 * * /usr/sbin/logrotate /etc/logrotate.conf
```

## Security Configuration

### Firewall Setup
```bash
# Install UFW
sudo apt install -y ufw

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH
sudo ufw allow ssh

# Allow web traffic
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Redis (if external access needed)
# sudo ufw allow 6379/tcp

# Enable firewall
sudo ufw enable
```

### File Permissions
```bash
#!/bin/bash
# /scripts/set-permissions.sh

APP_DIR="/var/www/production"
WEB_USER="www-data"

# Set correct ownership
sudo chown -R $WEB_USER:$WEB_USER $APP_DIR

# Set correct permissions
sudo find $APP_DIR -type f -exec chmod 644 {} \;
sudo find $APP_DIR -type d -exec chmod 755 {} \;

# Special permissions for storage
sudo chmod -R 775 $APP_DIR/storage
sudo chmod -R 775 $APP_DIR/bootstrap/cache

# Special permissions for artisan
sudo chmod +x $APP_DIR/artisan

echo "File permissions set correctly"
```

### Security Headers
```php
// app/Http/Middleware/SecurityHeaders.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Prevent clickjacking
        $response->header('X-Frame-Options', 'SAMEORIGIN');

        // Prevent XSS attacks
        $response->header('X-XSS-Protection', '1; mode=block');

        // Prevent MIME type sniffing
        $response->header('X-Content-Type-Options', 'nosniff');

        // Referrer policy
        $response->header('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Content Security Policy
        $response->header('Content-Security-Policy', "default-src 'self' https: data: blob: 'unsafe-inline'");

        // HSTS
        $response->header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

        return $response;
    }
}
```

## Performance Optimization

### PHP Optimization
```ini
# /etc/php/8.2/fpm/php.ini
; Memory limits
memory_limit = 256M
max_execution_time = 300
max_input_time = 300

; File uploads
upload_max_filesize = 100M
post_max_size = 100M
max_file_uploads = 20

; OPcache settings
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=4000
opcache.revalidate_freq=2
opcache.fast_shutdown=1
opcache.enable_cli=0
opcache.validate_timestamps=0
opcache.save_comments=0
opcache.load_comments=0

; Error reporting
display_errors=Off
log_errors=On
error_log=/var/log/php/error.log
```

### Nginx Optimization
```nginx
# Worker processes
worker_processes auto;
worker_connections 1024;

# Keep alive connections
keepalive_timeout 65;
keepalive_requests 100;

# Buffer sizes
client_body_buffer_size 128k;
client_max_body_size 100m;
client_header_buffer_size 1k;
large_client_header_buffers 4 4k;

# Timeouts
client_body_timeout 60s;
client_header_timeout 60s;
send_timeout 60s;

# Gzip compression
gzip_comp_level 6;
gzip_min_length 1000;
gzip_proxied any;
gzip_vary on;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/json
    application/javascript
    application/xml+rss
    application/atom+xml
    image/svg+xml;

# Static file caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Database Optimization
```sql
-- MySQL optimization settings
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL innodb_log_file_size = 268435456; -- 256MB
SET GLOBAL innodb_flush_log_at_trx_commit = 1;
SET GLOBAL innodb_flush_method = O_DIRECT;
SET GLOBAL innodb_file_per_table = 1;
SET GLOBAL innodb_thread_concurrency = 8;

-- Query cache
SET GLOBAL query_cache_type = 1;
SET GLOBAL query_cache_size = 67108864; -- 64MB
SET GLOBAL query_cache_limit = 2097152; -- 2MB

-- Connection settings
SET GLOBAL max_connections = 200;
SET GLOBAL wait_timeout = 60;
SET GLOBAL interactive_timeout = 60;

-- Slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

## Deployment Automation

### Deployment Script
```bash
#!/bin/bash
# /scripts/deploy.sh

set -e

# Configuration
REPO_URL="https://github.com/your-org/isp-management.git"
DEPLOY_DIR="/var/www/production"
BACKUP_DIR="/var/backups/pre-deploy"
BRANCH="main"
ENVIRONMENT="production"

echo "Starting deployment..."

# Create backup
echo "Creating backup..."
mkdir -p $BACKUP_DIR
cp -r $DEPLOY_DIR/storage $BACKUP_DIR/storage-$(date +%Y%m%d_%H%M%S)

# Pull latest code
echo "Pulling latest code..."
cd $DEPLOY_DIR
git fetch origin
git reset --hard origin/$BRANCH

# Install dependencies
echo "Installing dependencies..."
composer install --optimize-autoloader --no-dev
npm ci --production

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Clear caches
echo "Clearing caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache

# Optimize for production
echo "Optimizing for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart services
echo "Restarting services..."
sudo supervisorctl restart all
sudo systemctl reload nginx
sudo systemctl reload php8.2-fpm

# Run health check
echo "Running health check..."
php artisan health:check

echo "Deployment completed successfully!"
```

### Blue-Green Deployment
```bash
#!/bin/bash
# /scripts/blue-green-deploy.sh

set -e

CURRENT_DIR="/var/www/production"
BLUE_DIR="/var/www/blue"
GREEN_DIR="/var/www/green"

# Determine which is currently active
if [ -L "$CURRENT_DIR" ] && [ "$(readlink $CURRENT_DIR)" = "$BLUE_DIR" ]; then
    CURRENT="blue"
    INACTIVE="green"
else
    CURRENT="green"
    INACTIVE="blue"
fi

echo "Current environment: $CURRENT"
echo "Deploying to: $INACTIVE"

# Update inactive environment
echo "Updating $INACTIVE environment..."
cd $INACTIVE
git fetch origin
git reset --hard origin/main

# Install dependencies
composer install --optimize-autoloader --no-dev
npm ci --production

# Run migrations
php artisan migrate --force

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache

# Switch to new environment
echo "Switching to $INACTIVE..."
ln -sfn $INACTIVE $CURRENT_DIR

# Restart services
sudo supervisorctl restart all
sudo systemctl reload nginx
sudo systemctl reload php8.2-fpm

# Health check
sleep 10
php artisan health:check

echo "Deployment to $INACTIVE completed successfully!"
```

## Monitoring & Alerting

### Health Check Endpoint
```php
<?php
// routes/api.php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

Route::get('/api/health', function (Request $request) {
    $health = [
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
        'version' => config('app.version'),
        'environment' => config('app.env'),
        'services' => []
    ];

    // Check database
    try {
        DB::connection()->getPdo();
        $health['services']['database'] = [
            'status' => 'ok',
            'message' => 'Database connection successful'
        ];
    } catch (\Exception $e) {
        $health['status'] = 'error';
        $health['services']['database'] = [
            'status' => 'error',
            'message' => $e->getMessage()
        ];
    }

    // Check Redis
    try {
        Redis::ping();
        $health['services']['redis'] = [
            'status' => 'ok',
            'message' => 'Redis connection successful'
        ];
    } catch (\Exception $e) {
        $health['services']['redis'] = [
            'status' => 'error',
            'message' => $e->getMessage()
        ];
    }

    // Check disk space
    $freeSpace = disk_free('/');
    $totalSpace = disk_total('/');
    $diskUsage = ($totalSpace - $freeSpace) / $totalSpace * 100;

    $health['services']['disk'] = [
        'status' => $diskUsage > 90 ? 'warning' : 'ok',
        'usage_percentage' => round($diskUsage, 2),
        'free_gb' => round($freeSpace / 1024 / 1024 / 1024, 2),
        'total_gb' => round($totalSpace / 1024 / 1024 / 1024, 2)
    ];

    // Check memory usage
    $memoryUsage = memory_get_usage(true);
    $memoryLimit = ini_get('memory_limit');
    $memoryPercent = ($memoryUsage['rss'] / $memoryLimit) * 100;

    $health['services']['memory'] = [
        'status' => $memoryPercent > 90 ? 'warning' : 'ok',
        'usage_percentage' => round($memoryPercent, 2),
        'used_mb' => round($memoryUsage['rss'] / 1024 / 1024, 2),
        'limit_mb' => round($memoryLimit / 1024 / 1024, 2)
    ];

    $httpCode = $health['status'] === 'ok' ? 200 : 503;
    
    return response()->json($health, $httpCode);
});
```

### Alert Configuration
```bash
# /scripts/health-check.sh
#!/bin/bash

HEALTH_URL="https://your-domain.com/api/health"
WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

# Check health
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "Health check passed"
else
    echo "Health check failed with status: $RESPONSE"
    
    # Send alert to Slack
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"❌ ISP Management System Health Check Failed - Status: $RESPONSE\"}" \
        $WEBHOOK_URL
fi
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check MySQL status
sudo systemctl status mysql

# Check MySQL logs
sudo tail -f /var/log/mysql/error.log

# Test database connection
mysql -u production_user -p -h 127.0.0.1 isp_management_production

# Check MySQL configuration
sudo mysql -u root -p -e "SHOW VARIABLES LIKE 'max_connections';"
```

#### 2. PHP Issues
```bash
# Check PHP-FPM status
sudo systemctl status php8.2-fpm

# Check PHP-FPM logs
sudo tail -f /var/log/php8.2-fpm.log

# Check PHP configuration
php -i | grep memory_limit
php -i | grep max_execution_time
```

#### 3. Nginx Issues
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

#### 4. Permission Issues
```bash
# Check file permissions
ls -la /var/www/production/storage

# Fix ownership issues
sudo chown -R www-data:www-data /var/www/production/storage
sudo chmod -R 775 /var/www/production/storage
```

### Performance Issues
```bash
# Check system resources
htop
free -h
df -h

# Check slow queries
mysql -u root -p -e "SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;"

# Check PHP OPcache status
php -i | grep opcache
php -r 'print_r(opcache_get_status());'
```

## Rollback Procedures

### Database Rollback
```bash
#!/bin/bash
# /scripts/rollback-database.sh

BACKUP_FILE=$1
DB_NAME="isp_management_production"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "Rolling back database to: $BACKUP_FILE"

# Create current backup
mysqldump --single-transaction --routines --triggers \
  --host=127.0.0.1 --username=production_user \
  --password=$DB_PASSWORD $DB_NAME > /var/backups/emergency_backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
mysql -u production_user -p -h 127.0.0.1 $DB_NAME < $BACKUP_FILE

echo "Database rollback completed"
```

### Application Rollback
```bash
#!/bin/bash
# /scripts/rollback-application.sh

COMMIT_HASH=$1
APP_DIR="/var/www/production"

if [ -z "$COMMIT_HASH" ]; then
    echo "Usage: $0 <commit_hash>"
    exit 1
fi

echo "Rolling back application to: $COMMIT_HASH"

cd $APP_DIR

# Create current backup
git log --pretty=format:"%h" -1 > /var/backups/current_commit.txt

# Rollback to specified commit
git reset --hard $COMMIT_HASH

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache

# Restart services
sudo supervisorctl restart all
sudo systemctl reload nginx

echo "Application rollback completed"
```

## Maintenance Windows

### Maintenance Mode
```php
// Enable maintenance mode
php artisan down --message="System under maintenance. Please try again later."

// Disable maintenance mode
php artisan up
```

### Maintenance Page
```html
<!-- storage/framework/maintenance.html
<!DOCTYPE html>
<html>
<head>
    <title>System Maintenance</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .maintenance-container {
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0.1);
        }
        .icon {
            font-size: 48px;
            color: #f39c12;
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        p {
            color: #666;
            margin-bottom: 10px;
        }
        .progress {
            width: 100%;
            height: 4px;
            background-color: #e9ecef;
            border-radius: 2px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-bar {
            height: 100%;
            background-color: #007bff;
            animation: progress 2s ease-in-out infinite;
        }
        @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
        }
    </style>
</head>
<body>
    <div class="maintenance-container">
        <div class="icon">🔧</div>
        <h1>System Under Maintenance</h1>
        <p>We're currently performing scheduled maintenance.</p>
        <p>Please check back in a few minutes.</p>
        <div class="progress">
            <div class="progress-bar"></div>
        </div>
    </div>
</body>
</html>
```

## Documentation

### API Documentation
```bash
# Generate API documentation
php artisan api:docs --output=public/api/documentation.html

# Generate OpenAPI specification
php artisan api:docs --output=public/api/openapi.json
```

### User Documentation
```bash
# Generate user guide
php artisan docs:generate --output=docs/user-guide.md

# Generate admin guide
php artisan docs:generate --output=docs/admin-guide.md
```

This deployment guide provides comprehensive instructions for setting up and maintaining the ISP Management System in development, staging, and production environments.