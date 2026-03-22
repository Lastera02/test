<?php

declare(strict_types=1);

session_start();

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/csrf.php';

if (isset($_SESSION['admin_id'])) {
    header('Location: dashboard.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['csrf_token'] ?? null;

    if (!verifyCsrf($token)) {
        $error = 'Ошибка безопасности. Обновите страницу и попробуйте снова.';
    } else {
        $username = trim((string)($_POST['username'] ?? ''));
        $password = (string)($_POST['password'] ?? '');

        if ($username === '' || $password === '') {
            $error = 'Введите логин и пароль.';
        } else {
            $pdo = getPDO();
            $stmt = $pdo->prepare('SELECT id, username, password_hash FROM admins WHERE username = :username LIMIT 1');
            $stmt->execute(['username' => $username]);
            $admin = $stmt->fetch();

            if ($admin && password_verify($password, $admin['password_hash'])) {
                session_regenerate_id(true);
                $_SESSION['admin_id'] = (int)$admin['id'];
                $_SESSION['admin_username'] = $admin['username'];
                header('Location: dashboard.php');
                exit;
            }

            $error = 'Неверный логин или пароль.';
        }
    }
}
?>
<!doctype html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Вход — Service Center CRM</title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body class="login-page">
<div class="login-card">
    <h1>Вход в админ-панель</h1>
    <p class="subtitle">Учет заказов сервисного центра</p>

    <?php if ($error !== ''): ?>
        <div class="alert error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?></div>
    <?php endif; ?>

    <form method="post" class="form">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrfToken(), ENT_QUOTES, 'UTF-8'); ?>">

        <label for="username">Логин</label>
        <input id="username" type="text" name="username" required autofocus>

        <label for="password">Пароль</label>
        <input id="password" type="password" name="password" required>

        <button type="submit" class="btn primary full">Войти</button>
    </form>
</div>
</body>
</html>
