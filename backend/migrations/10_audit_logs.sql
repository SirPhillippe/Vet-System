-- Audit log table for tracking all system changes
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    user_role VARCHAR(20) NULL,
    action VARCHAR(20) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    record_id INT NULL,
    description TEXT NOT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at),
    INDEX idx_entity (entity),
    INDEX idx_user_id (user_id)
);
