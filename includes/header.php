<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/config.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

$currentPage = basename($_SERVER['PHP_SELF']);
?>
<!doctype html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= htmlspecialchars(APP_NAME, ENT_QUOTES, 'UTF-8'); ?></title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
<div class="app-shell">
    <header class="app-header">
        <a class="brand" href="dashboard.php">🔧 <?= htmlspecialchars(APP_NAME, ENT_QUOTES, 'UTF-8'); ?></a>
        <?php if (!empty($_SESSION['admin_username'])): ?>
            <nav class="main-nav">
                <a class="nav-link <?= $currentPage === 'dashboard.php' ? 'active' : ''; ?>" href="dashboard.php">Заказы</a>
                <a class="nav-link" href="logout.php">Выход</a>
            </nav>
        <?php endif; ?>
    </header>
    <main class="content">
