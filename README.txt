# SSLSIRLICS Setup Guide

This guide will help you set up the Smart Street Light System Information Resource Logging Interface and Control System (SSLSIRLICS) on your local machine.

## About SSLSIRLICS

Smart Street Light System developed under the research "RS-Program on Producing Alternative Clean Energy and Power" in Partnership with Caraga LGUs and CSU CRAFT.

## Prerequisites

### All-in-One Solution (Recommended)
- Laragon Full 6.0
  - Includes: Apache, MySQL, PHP, Node.js, and Composer
  - Download: https://laragon.org/download/

### Individual Components (Alternative Setup)
- PHP 8.2.28
- Composer 2.8.5
- MySQL 8.0.30
- Node.js 20+
- 7-Zip

## Initial Setup

### 1. Configure Laragon Quick-Add Repository
1. Navigate to: `C:\laragon\usr\sites.conf.d`
2. Create or edit `quick-add.conf`
3. Add the following package definitions:

```conf
# Core Components
php-8.2.28=https://windows.php.net/downloads/releases/php-8.2.28-nts-Win32-vs16-x64.zip
mysql-8.0.30=https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.30-winx64.zip
apache-2.4.62=https://www.apachelounge.com/download/VS17/binaries/httpd-2.4.62-240904-win64-VS17.zip
phpmyadmin-5.2.2=https://files.phpmyadmin.net/phpMyAdmin/5.2.2/phpMyAdmin-5.2.2-all-languages.zip
nodejs-20.18.1=https://nodejs.org/dist/v20.18.1/node-v20.18.1-win-x64.zip
```

### 2. Install Required Components

#### Installing 7-Zip
1. Download from https://7-zip.org/
2. Run installer
3. Add to System PATH:
   ```powershell
   # Open PowerShell as Administrator
   $path = [Environment]::GetEnvironmentVariable('Path', 'Machine')
   $newPath = $path + ';C:\Program Files\7-Zip'
   [Environment]::SetEnvironmentVariable('Path', $newPath, 'Machine')
   ```

#### Installing PHP 8.2.28
1. Right-click Laragon tray icon
2. Quick add > select "php-8.2.28"
3. Navigate to PHP > Version > PHP 8.2.28
4. Add to System PATH:
   ```powershell
   # Open PowerShell as Administrator
   $path = [Environment]::GetEnvironmentVariable('Path', 'Machine')
   $newPath = $path + ';C:\laragon\bin\php\php-8.2.28-Win32-vs16-x64'
   [Environment]::SetEnvironmentVariable('Path', $newPath, 'Machine')
   ```

#### Installing phpMyAdmin
1. Right-click Laragon tray icon
2. Quick add > "phpmyadmin-5.2.2"
3. Access at: http://localhost/phpmyadmin

## Project Setup

1. Extract Archive
   ```powershell
   # Extract to Laragon www directory
   Expand-Archive SSLSIRLIC.zip -DestinationPath C:\laragon\www\
   ```

2. Database Setup
   ```sql
   -- Using MySQL CLI
   CREATE DATABASE sslsirlic;
   USE sslsirlic;
   SOURCE C:\laragon\www\SSLSIRLIC\database\sslsirlic_dump.sql;
   ```

3. Environment Configuration
   ```powershell
   cd C:\laragon\www\SSLSIRLIC
   copy .env.example .env
   # Edit .env with your database credentials
   ```

4. Install Dependencies
   ```powershell
   composer install
   npm install
   npm run build
   ```

## Device Registration Format

SOCID Format: `{PROVINCE}-{MUNICIPALITY}-{BARANGAY}-{NUMBER}`
Example: `ADN-1000-0001-001`

## Troubleshooting Guide

| Issue | Solution |
|-------|----------|
| Blank page | Check `.env` configuration |
| Database error | Verify MySQL credentials |
| Node.js errors | Run `npm install` again |

## Support

- Documentation: [Project Wiki](https://github.com/AlienWolfX/SSLSIRLICS/wiki)
- Issues: [GitHub Issues](https://github.com/AlienWolfX/SSLSIRLICS/issues)
- Contact: CSU CRAFT Research Team
