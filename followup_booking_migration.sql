-- Layer 1 Database Migration
-- Adds columns to support follow-up bookings

-- Table: bookings
ALTER TABLE bookings
ADD COLUMN customer_phone text,
ADD COLUMN parent_booking_id uuid REFERENCES bookings(id),
ADD COLUMN consultation_round integer DEFAULT 1;

-- Table: programs
ALTER TABLE programs
ADD COLUMN followup_fee numeric DEFAULT 0;
