-- Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT,
    patient_name VARCHAR(100) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    owner_phone VARCHAR(20),
    pet_species VARCHAR(50) NOT NULL,
    pet_breed VARCHAR(100),
    pet_age INT,
    diagnosis TEXT NOT NULL,
    treatment TEXT NOT NULL,
    prescription TEXT,
    notes TEXT,
    vet_id INT NOT NULL,
    record_date DATE NOT NULL,
    next_visit_date DATE,
    status ENUM('active', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (vet_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_medical_records_patient ON medical_records(patient_name);
CREATE INDEX idx_medical_records_owner ON medical_records(owner_name);
CREATE INDEX idx_medical_records_vet ON medical_records(vet_id);
CREATE INDEX idx_medical_records_date ON medical_records(record_date); 