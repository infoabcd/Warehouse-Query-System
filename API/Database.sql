-- 创建 User 表
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY, 
  username VARCHAR(255) NOT NULL UNIQUE, 
  password VARCHAR(255) NOT NULL, 
  role TINYINT(1) DEFAULT FALSE, 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建 categories 表
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- 创建 commodities 表
CREATE TABLE commodities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    promotion_price DECIMAL(10, 2),
    is_on_promotion BOOLEAN DEFAULT FALSE,
    discount_amount DECIMAL(10, 2),
    stock INT NOT NULL DEFAULT 0,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建 commodity_categories 中间表
CREATE TABLE commodity_categories (
    commodity_id INT,
    category_id INT,
    PRIMARY KEY (commodity_id, category_id), -- 联合主键，确保唯一性
    FOREIGN KEY (commodity_id) REFERENCES commodities(id) ON DELETE CASCADE, -- 当商品删除时，相关联的记录也删除
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE   -- 当分类删除时，相关联的记录也删除
);

-- 插入分类数据
INSERT INTO categories (name) VALUES
('碗筷'),
('厨房用具'),
('日常用具'),
('胶制品'),
('铁制品'),
('农业工具'),
('特价商品');


---- 测试数据 ----
-- 插入商品数据
INSERT INTO commodities (title, description, price, original_price, promotion_price, is_on_promotion, stock, image_url) VALUES
('不锈钢炒锅', '高品质不锈钢炒锅，耐用易清洗', 120.00, 150.00, 100.00, TRUE, 50, 'url_to_wok.jpg'),
('陶瓷马克杯', '简约风格马克杯，居家办公必备', 25.00, NULL, NULL, FALSE, 200, 'url_to_mug.jpg'),
('洗碗布', '超强吸水性洗碗布，不伤手', 5.00, 8.00, 4.00, TRUE, 300, 'url_to_cloth.jpg'),
('多功能胶桶', '耐摔耐用，多种用途', 30.00, NULL, NULL, FALSE, 100, 'url_to_bucket.jpg');

-- 建立商品与分类的关联 (插入到 commodity_categories 表)
-- 假设 '不锈钢炒锅' (id=1) 属于 '厨房用具' (id=2), '铁制品' (id=5), '特价商品' (id=7)
INSERT INTO commodity_categories (commodity_id, category_id) VALUES
(1, 2),
(1, 5),
(1, 7);

-- 假设 '陶瓷马克杯' (id=2) 属于 '日常用具' (id=3)
INSERT INTO commodity_categories (commodity_id, category_id) VALUES
(2, 3);

-- 假设 '洗碗布' (id=3) 属于 '厨房用具' (id=2)
INSERT INTO commodity_categories (commodity_id, category_id) VALUES
(3, 2);

-- 假设 '多功能胶桶' (id=4) 属于 '胶制品' (id=4) 和 '农业工具' (id=6)
INSERT INTO commodity_categories (commodity_id, category_id) VALUES
(4, 4),
(4, 6);