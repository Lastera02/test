<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/csrf.php';
require_once __DIR__ . '/config/database.php';

requireLogin();

$statuses = ['На диагностике', 'В работе', 'Готов', 'Выдан'];
$deviceTypes = ['Смартфон', 'Ноутбук', 'Планшет', 'Телевизор', 'Игровая консоль', 'Другое'];

$pdo = getPDO();
$message = '';
$error = '';
$editingOrder = null;
$viewOrder = null;

$search = trim((string)($_GET['search'] ?? ''));
$statusFilter = trim((string)($_GET['status'] ?? ''));
$action = trim((string)($_GET['action'] ?? ''));
$editId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($action === 'edit' && $editId > 0) {
    $stmt = $pdo->prepare('SELECT * FROM orders WHERE id = :id');
    $stmt->execute(['id' => $editId]);
    $editingOrder = $stmt->fetch();

    if (!$editingOrder) {
        $error = 'Заказ не найден.';
    }
}

if ($action === 'view' && $editId > 0) {
    $stmt = $pdo->prepare('SELECT * FROM orders WHERE id = :id');
    $stmt->execute(['id' => $editId]);
    $viewOrder = $stmt->fetch();

    if (!$viewOrder) {
        $error = 'Заказ не найден.';
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['csrf_token'] ?? null;
    if (!verifyCsrf($token)) {
        $error = 'Ошибка безопасности. Обновите страницу и попробуйте снова.';
    } else {
        $postAction = $_POST['post_action'] ?? '';

        if ($postAction === 'create' || $postAction === 'update') {
            $orderId = (int)($_POST['id'] ?? 0);
            $firstName = trim((string)($_POST['first_name'] ?? ''));
            $lastName = trim((string)($_POST['last_name'] ?? ''));
            $phone = trim((string)($_POST['phone'] ?? ''));
            $deviceType = trim((string)($_POST['device_type'] ?? ''));
            $model = trim((string)($_POST['model'] ?? ''));
            $issue = trim((string)($_POST['issue_description'] ?? ''));
            $status = trim((string)($_POST['status'] ?? 'На диагностике'));

            if ($firstName === '' || $lastName === '' || $phone === '' || $deviceType === '' || $model === '' || $issue === '') {
                $error = 'Заполните все поля формы.';
            } elseif (!in_array($status, $statuses, true)) {
                $error = 'Некорректный статус заказа.';
            } else {
                if ($postAction === 'create') {
                    $stmt = $pdo->prepare(
                        'INSERT INTO orders (first_name, last_name, phone, device_type, model, issue_description, status) VALUES (:first_name, :last_name, :phone, :device_type, :model, :issue_description, :status)'
                    );
                    $stmt->execute([
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'phone' => $phone,
                        'device_type' => $deviceType,
                        'model' => $model,
                        'issue_description' => $issue,
                        'status' => $status,
                    ]);
                    $message = 'Заказ успешно создан.';
                } else {
                    $stmt = $pdo->prepare(
                        'UPDATE orders SET first_name = :first_name, last_name = :last_name, phone = :phone, device_type = :device_type, model = :model, issue_description = :issue_description, status = :status WHERE id = :id'
                    );
                    $stmt->execute([
                        'id' => $orderId,
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'phone' => $phone,
                        'device_type' => $deviceType,
                        'model' => $model,
                        'issue_description' => $issue,
                        'status' => $status,
                    ]);
                    $message = 'Заказ обновлен.';
                }
            }
        }

        if ($postAction === 'delete') {
            $orderId = (int)($_POST['id'] ?? 0);
            $stmt = $pdo->prepare('DELETE FROM orders WHERE id = :id');
            $stmt->execute(['id' => $orderId]);
            $message = 'Заказ удален.';
        }

        if ($postAction === 'change_status') {
            $orderId = (int)($_POST['id'] ?? 0);
            $newStatus = trim((string)($_POST['status'] ?? ''));

            if (in_array($newStatus, $statuses, true)) {
                $stmt = $pdo->prepare('UPDATE orders SET status = :status WHERE id = :id');
                $stmt->execute([
                    'id' => $orderId,
                    'status' => $newStatus,
                ]);
                $message = 'Статус заказа обновлен.';
            } else {
                $error = 'Некорректный статус.';
            }
        }
    }
}

$sql = 'SELECT * FROM orders WHERE 1=1';
$params = [];

if ($search !== '') {
    $sql .= ' AND (first_name LIKE :search OR last_name LIKE :search OR phone LIKE :search OR model LIKE :search OR issue_description LIKE :search)';
    $params['search'] = '%' . $search . '%';
}

if ($statusFilter !== '' && in_array($statusFilter, $statuses, true)) {
    $sql .= ' AND status = :status_filter';
    $params['status_filter'] = $statusFilter;
}

$sql .= ' ORDER BY created_at DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$orders = $stmt->fetchAll();

require_once __DIR__ . '/includes/header.php';
?>
<section class="panel">
    <div class="panel-head">
        <h1>Учет заказов</h1>
        <a class="btn secondary" href="dashboard.php">+ Новый заказ</a>
    </div>

    <?php if ($message !== ''): ?>
        <div class="alert success"><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8'); ?></div>
    <?php endif; ?>

    <?php if ($error !== ''): ?>
        <div class="alert error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?></div>
    <?php endif; ?>

    <form method="get" class="filters">
        <input type="text" name="search" value="<?= htmlspecialchars($search, ENT_QUOTES, 'UTF-8'); ?>" placeholder="Поиск: имя, телефон, модель...">

        <select name="status">
            <option value="">Все статусы</option>
            <?php foreach ($statuses as $status): ?>
                <option value="<?= htmlspecialchars($status, ENT_QUOTES, 'UTF-8'); ?>" <?= $statusFilter === $status ? 'selected' : ''; ?>>
                    <?= htmlspecialchars($status, ENT_QUOTES, 'UTF-8'); ?>
                </option>
            <?php endforeach; ?>
        </select>

        <button class="btn primary" type="submit">Применить</button>
        <a class="btn ghost" href="dashboard.php">Сбросить</a>
    </form>
</section>

<section class="panel">
    <h2><?= $editingOrder ? 'Редактирование заказа' : 'Добавление нового заказа'; ?></h2>

    <form method="post" class="form-grid">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
        <input type="hidden" name="post_action" value="<?= $editingOrder ? 'update' : 'create'; ?>">
        <input type="hidden" name="id" value="<?= $editingOrder ? (int)$editingOrder['id'] : 0; ?>">

        <div>
            <label for="first_name">Имя</label>
            <input id="first_name" name="first_name" type="text" value="<?= htmlspecialchars((string)($editingOrder['first_name'] ?? ''), ENT_QUOTES, 'UTF-8'); ?>" required>
        </div>

        <div>
            <label for="last_name">Фамилия</label>
            <input id="last_name" name="last_name" type="text" value="<?= htmlspecialchars((string)($editingOrder['last_name'] ?? ''), ENT_QUOTES, 'UTF-8'); ?>" required>
        </div>

        <div>
            <label for="phone">Телефон</label>
            <input id="phone" name="phone" type="text" value="<?= htmlspecialchars((string)($editingOrder['phone'] ?? ''), ENT_QUOTES, 'UTF-8'); ?>" required>
        </div>

        <div>
            <label for="device_type">Тип устройства</label>
            <select id="device_type" name="device_type" required>
                <option value="">Выберите тип</option>
                <?php foreach ($deviceTypes as $deviceType): ?>
                    <option value="<?= htmlspecialchars($deviceType, ENT_QUOTES, 'UTF-8'); ?>" <?= (($editingOrder['device_type'] ?? '') === $deviceType) ? 'selected' : ''; ?>>
                        <?= htmlspecialchars($deviceType, ENT_QUOTES, 'UTF-8'); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>

        <div>
            <label for="model">Модель</label>
            <input id="model" name="model" type="text" value="<?= htmlspecialchars((string)($editingOrder['model'] ?? ''), ENT_QUOTES, 'UTF-8'); ?>" required>
        </div>

        <div>
            <label for="status">Статус</label>
            <select id="status" name="status" required>
                <?php foreach ($statuses as $status): ?>
                    <option value="<?= htmlspecialchars($status, ENT_QUOTES, 'UTF-8'); ?>" <?= (($editingOrder['status'] ?? 'На диагностике') === $status) ? 'selected' : ''; ?>>
                        <?= htmlspecialchars($status, ENT_QUOTES, 'UTF-8'); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>

        <div class="full-width">
            <label for="issue_description">Описание неисправности</label>
            <textarea id="issue_description" name="issue_description" rows="3" required><?= htmlspecialchars((string)($editingOrder['issue_description'] ?? ''), ENT_QUOTES, 'UTF-8'); ?></textarea>
        </div>

        <div class="full-width actions">
            <button class="btn primary" type="submit"><?= $editingOrder ? 'Сохранить изменения' : 'Создать заказ'; ?></button>
            <?php if ($editingOrder): ?>
                <a href="dashboard.php" class="btn ghost">Отмена</a>
            <?php endif; ?>
        </div>
    </form>
</section>

<section class="panel">
    <h2>Таблица заказов</h2>
    <div class="table-wrap">
        <table>
            <thead>
            <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Фамилия</th>
                <th>Телефон</th>
                <th>Тип устройства</th>
                <th>Модель</th>
                <th>Описание неисправности</th>
                <th>Статус</th>
                <th>Дата создания</th>
                <th>Дата обновления</th>
                <th>Действия</th>
            </tr>
            </thead>
            <tbody>
            <?php if (!$orders): ?>
                <tr>
                    <td colspan="11" class="empty">Нет заказов по текущему фильтру.</td>
                </tr>
            <?php else: ?>
                <?php foreach ($orders as $order): ?>
                    <tr>
                        <td><?= (int)$order['id']; ?></td>
                        <td><?= htmlspecialchars($order['first_name'], ENT_QUOTES, 'UTF-8'); ?></td>
                        <td><?= htmlspecialchars($order['last_name'], ENT_QUOTES, 'UTF-8'); ?></td>
                        <td><?= htmlspecialchars($order['phone'], ENT_QUOTES, 'UTF-8'); ?></td>
                        <td><?= htmlspecialchars($order['device_type'], ENT_QUOTES, 'UTF-8'); ?></td>
                        <td><?= htmlspecialchars($order['model'], ENT_QUOTES, 'UTF-8'); ?></td>
                        <td class="issue-cell"><?= htmlspecialchars($order['issue_description'], ENT_QUOTES, 'UTF-8'); ?></td>
                        <td>
                            <form method="post" class="inline-form">
                                <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
                                <input type="hidden" name="post_action" value="change_status">
                                <input type="hidden" name="id" value="<?= (int)$order['id']; ?>">
                                <select name="status" onchange="this.form.submit()">
                                    <?php foreach ($statuses as $status): ?>
                                        <option value="<?= htmlspecialchars($status, ENT_QUOTES, 'UTF-8'); ?>" <?= $order['status'] === $status ? 'selected' : ''; ?>>
                                            <?= htmlspecialchars($status, ENT_QUOTES, 'UTF-8'); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </form>
                        </td>
                        <td><?= htmlspecialchars((string)$order['created_at'], ENT_QUOTES, 'UTF-8'); ?></td>
                        <td><?= htmlspecialchars((string)$order['updated_at'], ENT_QUOTES, 'UTF-8'); ?></td>
                        <td>
                            <div class="table-actions">
                                <a class="btn tiny" href="dashboard.php?action=view&id=<?= (int)$order['id']; ?>">Просмотр</a>
                                <a class="btn tiny secondary" href="dashboard.php?action=edit&id=<?= (int)$order['id']; ?>">Редактировать</a>
                                <form method="post" onsubmit="return confirm('Удалить заказ #<?= (int)$order['id']; ?>?');">
                                    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(csrfToken(), ENT_QUOTES, 'UTF-8'); ?>">
                                    <input type="hidden" name="post_action" value="delete">
                                    <input type="hidden" name="id" value="<?= (int)$order['id']; ?>">
                                    <button class="btn tiny danger" type="submit">Удалить</button>
                                </form>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
            </tbody>
        </table>
    </div>
</section>

<?php if ($viewOrder): ?>
    <section class="panel">
        <h2>Просмотр заказа #<?= (int)$viewOrder['id']; ?></h2>
        <div class="details-grid">
            <div><strong>Имя:</strong> <?= htmlspecialchars($viewOrder['first_name'], ENT_QUOTES, 'UTF-8'); ?></div>
            <div><strong>Фамилия:</strong> <?= htmlspecialchars($viewOrder['last_name'], ENT_QUOTES, 'UTF-8'); ?></div>
            <div><strong>Телефон:</strong> <?= htmlspecialchars($viewOrder['phone'], ENT_QUOTES, 'UTF-8'); ?></div>
            <div><strong>Тип устройства:</strong> <?= htmlspecialchars($viewOrder['device_type'], ENT_QUOTES, 'UTF-8'); ?></div>
            <div><strong>Модель:</strong> <?= htmlspecialchars($viewOrder['model'], ENT_QUOTES, 'UTF-8'); ?></div>
            <div><strong>Статус:</strong> <?= htmlspecialchars($viewOrder['status'], ENT_QUOTES, 'UTF-8'); ?></div>
            <div class="full-width"><strong>Описание неисправности:</strong> <?= nl2br(htmlspecialchars($viewOrder['issue_description'], ENT_QUOTES, 'UTF-8')); ?></div>
            <div><strong>Создан:</strong> <?= htmlspecialchars((string)$viewOrder['created_at'], ENT_QUOTES, 'UTF-8'); ?></div>
            <div><strong>Обновлен:</strong> <?= htmlspecialchars((string)$viewOrder['updated_at'], ENT_QUOTES, 'UTF-8'); ?></div>
        </div>
    </section>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
