CREATE DATABASE IF NOT EXISTS service_center CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE service_center;

DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS admins;

CREATE TABLE admins (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    device_type VARCHAR(100) NOT NULL,
    model VARCHAR(150) NOT NULL,
    issue_description TEXT NOT NULL,
    status ENUM('На диагностике', 'В работе', 'Готов', 'Выдан') NOT NULL DEFAULT 'На диагностике',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_name_phone (last_name, first_name, phone)
) ENGINE=InnoDB;

-- Логин: admin
-- Пароль: admin12345
INSERT INTO admins (username, password_hash) VALUES
('admin', '$2y$12$afE9BKYSwuKI18Udd5Btw.HO.CqLS360L7PJjEALrfQBhlu.qcwGi');

INSERT INTO orders (first_name, last_name, phone, device_type, model, issue_description, status) VALUES
('Иван', 'Петров', '+7 999 123-45-67', 'Смартфон', 'iPhone 13', 'Не заряжается после падения.', 'На диагностике'),
('Ольга', 'Смирнова', '+7 921 555-77-88', 'Ноутбук', 'ASUS VivoBook 15', 'Сильно шумит кулер, перегревается.', 'В работе'),
('Артем', 'Козлов', '+7 903 777-00-11', 'Телевизор', 'Samsung UE50AU7100', 'Нет изображения, звук есть.', 'Готов');
