/**
 * Şema değişiklikleri. Sıra önemlidir; yayında olan bir girdi değiştirilmez, yenisi eklenir.
 * MySQL 8 ve MariaDB 10.6+ ile uyumlu yazılır. Maliyet verisi hiçbir tabloda yoktur.
 */
export interface Migration { id: string; statements: string[] }

const T = "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

export const MIGRATIONS: Migration[] = [
  {
    id: "001_menu",
    statements: [
      `CREATE TABLE menu_groups (
        id INT PRIMARY KEY AUTO_INCREMENT,
        slug VARCHAR(64) NOT NULL UNIQUE,
        name_tr VARCHAR(120) NOT NULL, name_en VARCHAR(120) NULL, name_ar VARCHAR(120) NULL,
        color ENUM('red','yellow','pink','blue','green','gray') NOT NULL,
        sort_order INT NOT NULL DEFAULT 0
      ) ${T}`,
      `CREATE TABLE categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        slug VARCHAR(64) NOT NULL UNIQUE,
        group_id INT NOT NULL,
        name_tr VARCHAR(120) NOT NULL, name_en VARCHAR(120) NULL, name_ar VARCHAR(120) NULL,
        sort_order INT NOT NULL DEFAULT 0,
        is_visible TINYINT(1) NOT NULL DEFAULT 1,
        default_in_suggest TINYINT(1) NOT NULL DEFAULT 0,
        default_temp ENUM('hot','cold') NULL,
        CONSTRAINT fk_cat_group FOREIGN KEY (group_id) REFERENCES menu_groups(id)
      ) ${T}`,
      `CREATE TABLE products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        slug VARCHAR(96) NOT NULL UNIQUE,
        category_id INT NOT NULL,
        name VARCHAR(160) NOT NULL, name_en VARCHAR(160) NULL, name_ar VARCHAR(160) NULL,
        desc_tr TEXT NULL, desc_en TEXT NULL, desc_ar TEXT NULL,
        ingredients_tr TEXT NULL, ingredients_en TEXT NULL, ingredients_ar TEXT NULL,
        kcal INT NULL,
        allergens VARCHAR(255) NOT NULL DEFAULT '',
        allergens_entered TINYINT(1) NOT NULL DEFAULT 0,
        temp ENUM('hot','cold') NULL,
        in_suggest TINYINT(1) NULL,
        image_key VARCHAR(96) NULL,
        image_focus_x DOUBLE NOT NULL DEFAULT 0.5,
        image_focus_y DOUBLE NOT NULL DEFAULT 0.5,
        is_new TINYINT(1) NOT NULL DEFAULT 0,
        is_featured TINYINT(1) NOT NULL DEFAULT 0,
        is_visible TINYINT(1) NOT NULL DEFAULT 1,
        sold_out_until DATETIME(3) NULL,
        sort_order INT NOT NULL DEFAULT 0,
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        CONSTRAINT fk_prod_cat FOREIGN KEY (category_id) REFERENCES categories(id)
      ) ${T}`,
      `CREATE TABLE product_variants (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        label_key ENUM('normal','buyuk','tek','duble') NULL,
        price_kurus INT NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        CONSTRAINT fk_var_prod FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ${T}`,
      `CREATE TABLE extras (
        id INT PRIMARY KEY AUTO_INCREMENT,
        slug VARCHAR(64) NOT NULL UNIQUE,
        name_tr VARCHAR(120) NOT NULL, name_en VARCHAR(120) NULL, name_ar VARCHAR(120) NULL,
        price_kurus INT NOT NULL,
        sort_order INT NOT NULL DEFAULT 0
      ) ${T}`,
      `CREATE TABLE extra_categories (
        extra_id INT NOT NULL,
        category_id INT NOT NULL,
        PRIMARY KEY (extra_id, category_id),
        CONSTRAINT fk_xc_extra FOREIGN KEY (extra_id) REFERENCES extras(id) ON DELETE CASCADE,
        CONSTRAINT fk_xc_cat FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      ) ${T}`,
      `CREATE TABLE settings (
        id TINYINT PRIMARY KEY,
        wifi_ssid VARCHAR(120) NOT NULL, wifi_username VARCHAR(120) NOT NULL, wifi_password VARCHAR(255) NOT NULL,
        wifi_note_tr TEXT NOT NULL, wifi_note_en TEXT NULL, wifi_note_ar TEXT NULL,
        opening_time CHAR(5) NOT NULL,
        footer_note_tr VARCHAR(255) NOT NULL, footer_note_en VARCHAR(255) NULL, footer_note_ar VARCHAR(255) NULL,
        stats_enabled TINYINT(1) NOT NULL DEFAULT 1,
        menu_updated_at DATETIME(3) NOT NULL,
        last_backup_at DATETIME(3) NULL,
        CONSTRAINT one_row CHECK (id = 1)
      ) ${T}`,
    ],
  },
];
