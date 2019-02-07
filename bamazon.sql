DROP DATABASE IF EXISTS bamazon_DB;
CREATE DATABASE bamazon_DB;

USE bamazon_DB;

CREATE TABLE products (
    item_id INT NOT NULL auto_increment,
    product_name VARCHAR(30) NULL,
    department_name VARCHAR(30) NULL,
    price DECIMAL (10,2) NULL,
    stock_quantity INT NOT NULL,
    primary key (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Leather Jacket", "Clothing", 30.99, 10),("Electric Toothbrush", "Health & Personal Care", 24.99, 5),("Cat Towers", "Animal Supplies", 38.99, 14),("Gym Shirts", "Workout Clothes", 24.69, 3),("Utensils Set", "Kitchen Tools", 24.99, 4),("Lavender Candle", "Candles & Home Fragrance", 30, 2),("Beach Towels", "Beach Towels", 20.99, 10),("Kindle Paperwhite", "Technology", 99.99, 5),("Bose Headphones Wireless", "Headphones", 149.99, 2),("Makeup Brush Set", "Beauty", 10.19, 6);

SELECT * FROM products;