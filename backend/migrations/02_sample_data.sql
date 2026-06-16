-- Insert sample users (vets)
INSERT INTO users (name, email, password, role, phone, specialization) VALUES
('Dr. John Smith', 'john.smith@vettech.com', '$2b$10$xxxxxxxxxxx', 'vet', '555-0101', 'General Practice'),
('Dr. Sarah Wilson', 'sarah.wilson@vettech.com', '$2b$10$xxxxxxxxxxx', 'vet', '555-0102', 'Surgery'),
('Dr. Maria Garcia', 'maria.garcia@vettech.com', '$2b$10$xxxxxxxxxxx', 'vet', '555-0103', 'Internal Medicine');

-- Insert sample services
INSERT INTO services (name, description, duration, price) VALUES
('General Checkup', 'Routine health examination and consultation', 30, 50.00),
('Vaccination', 'Standard pet vaccinations', 20, 35.00),
('Dental Cleaning', 'Professional dental cleaning and examination', 60, 120.00),
('Surgery Consultation', 'Pre-surgery consultation and assessment', 45, 85.00),
('Emergency Visit', 'Urgent care services', 60, 150.00);

-- Insert sample appointments
INSERT INTO appointments (
    client_name, client_email, client_phone, pet_name, pet_type, 
    pet_breed, service_id, vet_id, appointment_date, appointment_time, 
    status, payment_status
) VALUES
('Alice Johnson', 'alice@email.com', '555-0001', 'Max', 'Dog', 'Golden Retriever', 1, 1, 
 CURDATE() + INTERVAL 1 DAY, '10:00:00', 'confirmed', 'paid'),
('Bob Wilson', 'bob@email.com', '555-0002', 'Luna', 'Cat', 'Siamese', 2, 2, 
 CURDATE() + INTERVAL 2 DAY, '14:30:00', 'pending', 'pending'),
('Carol Martinez', 'carol@email.com', '555-0003', 'Rocky', 'Dog', 'German Shepherd', 3, 3, 
 CURDATE() + INTERVAL 3 DAY, '11:00:00', 'confirmed', 'paid');

-- Insert sample newsletter subscriptions
INSERT INTO newsletter_subscriptions (email, status) VALUES
('newsletter1@email.com', 'active'),
('newsletter2@email.com', 'active'),
('newsletter3@email.com', 'unsubscribed'); 