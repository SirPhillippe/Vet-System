-- Add payment receipt columns to appointments table (idempotent)
-- payment_method   : how the client paid (e.g. EcoCash, Visa)
-- payment_reference: transaction reference for the payment
-- receipt_number   : human-friendly receipt id shown on the confirmation/receipt page
-- NOTE: "amount paid" reuses the existing appointments.price column.

-- payment_method
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'appointments'
    AND COLUMN_NAME = 'payment_method'
);
SET @ddl := IF(
  @col_exists = 0,
  'ALTER TABLE appointments ADD COLUMN payment_method VARCHAR(30) NULL AFTER payment_status',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- payment_reference
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'appointments'
    AND COLUMN_NAME = 'payment_reference'
);
SET @ddl := IF(
  @col_exists = 0,
  'ALTER TABLE appointments ADD COLUMN payment_reference VARCHAR(50) NULL AFTER payment_method',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- receipt_number
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'appointments'
    AND COLUMN_NAME = 'receipt_number'
);
SET @ddl := IF(
  @col_exists = 0,
  'ALTER TABLE appointments ADD COLUMN receipt_number VARCHAR(30) NULL AFTER payment_reference',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
