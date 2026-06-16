-- Change pet_age from INT to DECIMAL(4,2) to support fractional ages (months)
-- Safe: existing integer values (e.g. 3) become 3.00 with no data loss

ALTER TABLE appointments MODIFY COLUMN pet_age DECIMAL(4,2) NULL;
ALTER TABLE medical_records MODIFY COLUMN pet_age DECIMAL(4,2) NULL;
