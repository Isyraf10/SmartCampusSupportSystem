CREATE DATABASE IF NOT EXISTS academic_support_db;
USE academic_support_db;

CREATE TABLE IF NOT EXISTS academic_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL UNIQUE,
    gpa DECIMAL(3,2) NOT NULL,
    cgpa DECIMAL(3,2) NOT NULL,
    current_semester INT NOT NULL
);

CREATE TABLE IF NOT EXISTS class_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    day VARCHAR(20) NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    classroom VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS advisor_appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    advisor_name VARCHAR(255) NOT NULL,
    appointment_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);