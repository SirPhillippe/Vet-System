-- Add pet_age column to appointments table (idempotent)
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'appointments'
    AND COLUMN_NAME = 'pet_age'
);

SET @ddl := IF(
  @col_exists = 0,
  'ALTER TABLE appointments ADD COLUMN pet_age INT NULL AFTER pet_breed',
  'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


