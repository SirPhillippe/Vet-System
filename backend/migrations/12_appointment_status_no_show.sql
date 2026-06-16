-- Allow the "no-show" appointment status.
-- The admin appointments UI has a "No Show" action that sends status = 'no-show',
-- but the original ENUM only allowed pending/confirmed/completed/cancelled, so the
-- value was silently truncated to an empty string. Widen the ENUM so the status
-- (and its notification email) reflects reality.
ALTER TABLE appointments
  MODIFY COLUMN status ENUM('pending', 'confirmed', 'completed', 'no-show', 'cancelled') NOT NULL DEFAULT 'pending';
