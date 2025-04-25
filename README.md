# SSLSIRLICS Setup Guide

This guide will help you set up the SSLSIRLICS project on your local machine. The archive you downloaded contains all necessary files, including a MySQL database dump for import.

---

## About SSLSIRLICS

Smart Street Light System which is under the research "RS-Program on Producing Alternative Clean Energy and Power in Partnership of Caraga LGU's | CSU CRAFT

---

## Prerequisites

### All-in-One (Recommended)

-   **Laragon Full 6.0** (includes Apache, MySQL, PHP, Node.js, Composer)

### Individual Packages (if not using Laragon)

-   **PHP 8.2.28**
-   **Composer 2.8.5**
-   **MySQL 8.0.30**
-   **Node.js 20+**

---

## Step-by-Step Setup

### 1. Extract the Archive

Unzip the archive to your preferred development directory (e.g., `C:\laragon\www\SSLSIRLIC`).

---

### 2. Import the MySQL Database

1. Open **phpMyAdmin** or use the MySQL command line.
2. Create a new database (e.g., `sslsirlic`).
3. Import the provided SQL dump file (e.g., `sslsirlic_dump.sql`):

    **Using phpMyAdmin:**

    - Select your new database.
    - Click "Import" and choose the SQL file.

    **Using command line:**

    ```sh
    mysql -u root -p sslsirlic < sslsirlic_dump.sql
    ```

---

### 3. Configure Environment Variables

1. Copy the example environment file:
    ```sh
    cp .env.example .env
    ```
2. Edit `.env` and update the following lines to match your MySQL setup:
    ```
    DB_DATABASE=sslsirlic
    DB_USERNAME=root
    DB_PASSWORD=your_mysql_password
    ```
    Adjust other settings as needed.

---

### 4. Install PHP Dependencies

```bash
composer install
```

---

### 5. Install Node.js Dependencies

```bash
npm install
```

### 6. Build Frontend Assets

```bash
npm run build
```

or, if using Vite for development:

```bash
npm run dev
```

---

### 7. Start the Development Server

If using Laragon, your project will be available at `http://localhost/SSLSIRLIC`.

---

## Troubleshooting

-   **Blank page or errors?**  
    Check your `.env` settings and ensure all dependencies are installed.
-   **Database connection issues?**  
    Make sure MySQL is running and credentials in `.env` are correct.
-   **Node/Vite errors?**  
    Ensure you have Node.js 20+ and run `npm install` again.

---

## Credits

-   Research by CSU CRAFT in partnership with Caraga LGUs.
-   For questions, visit [https://github.com/AlienWolfX](https://github.com/AlienWolfX).

---
