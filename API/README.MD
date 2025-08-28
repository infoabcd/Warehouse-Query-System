# DATABASE
- commodity
 - category
 - title
 - intro
 - stock
 - money


ategories 表： 存储所有可用的商品分类。
commodities 表： 存储商品的基本信息。
commodity_categories 表： 中间表，用于关联商品和分类。

- category
 - id               	INT	            PRIMARY KEY, AUTO_INCREMENT	    分类唯一ID
 - name	                VARCHAR(255)	NOT NULL, UNIQUE	            分类名称

 0 碗筷(勺子)
 1 厨房用具(锅，锅铲，洗碗布，手套)
 2 日常用具(水杯，牙刷，垃圾铲)
 3 胶制品(凳子，胶盆，胶桶，油桶)
 4 铁制品(蒸架，铁桶)
 5 农业工具(牛筋胶桶，鸡饲用具)
 6 特价商品

- commodity
 - id                   INT	            PRIMARY KEY, AUTO_INCREMENT	    商品唯一ID
 - title                VARCHAR(255)	NOT NULL	                    商品标题
 - description          TEXT		                                    商品描述
 - price                DECIMAL(10, 2)	NOT NULL	                    当前售价 (或默认价)
 - original_price       DECIMAL(10, 2)		                            原始价格 (用于划线价)
 - promotion_price      DECIMAL(10, 2)		                            促销价格
 - is_on_promotion      BOOLEAN         DEFAULT FALSE	                是否正在促销
 - discount_amount      DECIMAL(10, 2)		                            折扣金额 (或百分比，可选)
 - stock                INT	            NOT NULL, DEFAULT 0	            库存数量
 - image_url            VARCHAR(255)		                            商品图片URL
 - created_at	        TIMESTAMP	    DEFAULT CURRENT_TIMESTAMP	                            创建时间
 - updated_at	        TIMESTAMP	    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP	更新时间 

- commodity_categories
 - commodity_id     INT     FOREIGN KEY (references commodities.id)     商品ID
 - category_id      INT	    FOREIGN KEY (references categories.id)	    分类ID
                            PRIMARY KEY (commodity_id, category_id)	    联合主键
