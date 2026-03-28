-- 为已有数据库增加条形码字段（在 MySQL/MariaDB 中执行一次即可）
ALTER TABLE commodities
  ADD COLUMN barcode VARCHAR(64) NULL DEFAULT NULL COMMENT '商品条码 EAN/UPC 等';

CREATE UNIQUE INDEX idx_commodities_barcode ON commodities (barcode);
