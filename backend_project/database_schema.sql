-- Database schema for Garage Service Inventory Management System

CREATE DATABASE IF NOT EXISTS Garage_service;
USE Garage_service;

-- Table for Users
CREATE TABLE IF NOT EXISTS Users (
    Userid INT AUTO_INCREMENT PRIMARY KEY,
    UserName VARCHAR(255) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Purchased Spare Parts
CREATE TABLE IF NOT EXISTS Purchasedspareparts (
    P_id INT AUTO_INCREMENT PRIMARY KEY,
    P_name VARCHAR(255) NOT NULL,
    quality VARCHAR(255) NOT NULL,
    total_price DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for Stock In
CREATE TABLE IF NOT EXISTS stock_in (
    in_id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    quality INT NOT NULL,
    P_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (P_id) REFERENCES Purchasedspareparts(P_id) ON DELETE CASCADE
);

-- Table for Stock Out
CREATE TABLE IF NOT EXISTS stock_out (
    out_id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    quality INT NOT NULL,
    P_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (P_id) REFERENCES Purchasedspareparts(P_id) ON DELETE CASCADE
);
