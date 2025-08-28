/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.7.2-MariaDB, for osx10.20 (arm64)
--
-- Host: localhost    Database: test
-- ------------------------------------------------------
-- Server version	11.7.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Current Database: `test`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `test` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `test`;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES
(6,'农业工具'),
(2,'厨房用具'),
(3,'日常用具'),
(7,'特价商品'),
(1,'碗筷'),
(4,'胶制品'),
(5,'铁制品');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commodities`
--

DROP TABLE IF EXISTS `commodities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `commodities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `promotion_price` decimal(10,2) DEFAULT NULL,
  `is_on_promotion` tinyint(1) DEFAULT 0,
  `discount_amount` decimal(10,2) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commodities`
--

LOCK TABLES `commodities` WRITE;
/*!40000 ALTER TABLE `commodities` DISABLE KEYS */;
INSERT INTO `commodities` VALUES
(1,'不锈钢炒锅','高品质不锈钢炒锅，耐用易清洗',150.00,100.00,120.00,1,NULL,50,'url_to_wok.jpg','2025-08-01 03:56:32','2025-08-18 10:38:24'),
(2,'陶瓷马克杯','简约风格马克杯，居家办公必备',25.00,20.00,NULL,0,NULL,200,'url_to_mug.jpg','2025-08-01 03:56:32','2025-08-18 10:38:24'),
(3,'洗碗布','超强吸水性洗碗布，不伤手',8.00,4.00,4.00,1,NULL,300,'url_to_cloth.jpg','2025-08-01 03:56:32','2025-08-18 10:38:24'),
(4,'多功能胶桶','耐摔耐用，多种用途',30.00,20.00,NULL,0,NULL,100,'url_to_bucket.jpg','2025-08-01 03:56:32','2025-08-18 10:38:24'),
(6,'TEST','TEST',30.00,20.00,NULL,0,NULL,100,'url_to_bucket.jpg','2025-08-01 03:56:32','2025-08-26 16:10:25'),
(7,'TEST','TEST',30.00,20.00,NULL,0,NULL,100,'url_to_bucket.jpg','2025-08-01 03:56:32','2025-08-26 16:10:25'),
(12,'TEST','TEST',30.00,20.00,NULL,0,NULL,100,'url_to_bucket.jpg','2025-08-01 03:56:32','2025-08-26 16:10:25'),
(13,'TEST','TEST',30.00,20.00,NULL,0,NULL,100,'url_to_bucket.jpg','2025-08-01 03:56:32','2025-08-26 16:10:25'),
(14,'TEST','TEST',30.00,20.00,NULL,0,NULL,100,'url_to_bucket.jpg','2025-08-01 03:56:32','2025-08-26 16:10:25'),
(15,'TEST','TEST',30.00,20.00,NULL,0,NULL,100,'url_to_bucket.jpg','2025-08-01 03:56:32','2025-08-26 16:10:25'),
(16,'TEST','TEST',30.00,20.00,NULL,0,NULL,100,'url_to_bucket.jpg','2025-08-01 03:56:32','2025-08-26 16:10:25'),
(17,'TEST','TEST',30.00,20.00,NULL,0,NULL,100,'url_to_bucket.jpg','2025-08-01 03:56:32','2025-08-26 16:10:25'),
(18,'TEST','TEST',30.00,20.00,NULL,0,NULL,100,'url_to_bucket.jpg','2025-08-01 03:56:32','2025-08-26 16:10:25'),
(19,'TEST','TEST',30.00,20.00,NULL,0,NULL,100,'url_to_bucket.jpg','2025-08-01 03:56:32','2025-08-26 16:10:25'),
(20,'TEST','TEST',30.00,20.00,NULL,0,NULL,100,'url_to_bucket.jpg','2025-08-01 03:56:32','2025-08-26 16:10:25'),
(21,'TEST','TEST',30.00,20.00,NULL,0,NULL,100,'url_to_bucket.jpg','2025-08-01 03:56:32','2025-08-26 16:10:25'),
(22,'TEST','TEST',30.00,20.00,NULL,0,NULL,100,'url_to_bucket.jpg','2025-08-01 03:56:32','2025-08-26 16:10:25'),
(23,'TEST','TEST',30.00,20.00,NULL,0,NULL,100,'url_to_bucket.jpg','2025-08-01 03:56:32','2025-08-26 16:10:25'),
(27,'美军','伊拉克',911.00,991.00,921.00,1,NULL,2,'image-1756281388900-215114231.jpg','2025-08-27 07:56:48','2025-08-27 08:01:10'),
(28,'黑','鬼',2.00,0.80,NULL,0,NULL,999,'image-1756282282234-72108308.jpg','2025-08-27 08:11:43','2025-08-27 08:12:12'),
(29,'装甲车','强力去犹',99.00,80.00,NULL,0,NULL,8,'image-1756282832365-662906537.jpg','2025-08-27 08:21:42','2025-08-27 08:21:42');
/*!40000 ALTER TABLE `commodities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commodity_categories`
--

DROP TABLE IF EXISTS `commodity_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `commodity_categories` (
  `commodity_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  PRIMARY KEY (`commodity_id`,`category_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `commodity_categories_ibfk_1` FOREIGN KEY (`commodity_id`) REFERENCES `commodities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `commodity_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commodity_categories`
--

LOCK TABLES `commodity_categories` WRITE;
/*!40000 ALTER TABLE `commodity_categories` DISABLE KEYS */;
INSERT INTO `commodity_categories` VALUES
(1,2),
(3,2),
(2,3),
(4,4),
(1,5),
(28,5),
(29,5),
(4,6),
(28,6),
(1,7);
/*!40000 ALTER TABLE `commodity_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'admina','$2b$10$g335De3ZQGbZ2iG3k7h45uT1WXw0oQFk9SCaJtL7lzWIct6N/7iPu',1,'2025-08-08 13:19:47','2025-08-08 13:19:47');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-08-28 15:06:25
