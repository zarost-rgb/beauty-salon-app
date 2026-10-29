-- Database initialization script for Beauty Salon App (Bellezza Studio)
-- Executed on first startup of PostgreSQL container

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    duration_min INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(10) NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'potwierdzona',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for appointment lookup by date and service
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_service ON appointments(service_id);

-- Seed services with salon offerings in Polish
INSERT INTO services (name, description, price, duration_min) VALUES
('Strzyżenie i stylizacja damska', 'Mycie, relaksujący masaż głowy, cięcie dopasowane do kształtu twarzy oraz modelowanie na szczotkę.', 120.00, 60),
('Strzyżenie męskie z pielęgnacją brody', 'Precyzyjne strzyżenie włosów maszynką i nożyczkami, trymowanie brody z konturowaniem brzytwą i balsamem nawilżającym.', 80.00, 45),
('Manicure hybrydowy', 'Opracowanie skórek, nadanie kształtu paznokciom, peeling dłoni oraz malowanie lakierem hybrydowym utwardzanym UV/LED.', 110.00, 60),
('Masaż relaksacyjny twarzy i szyi', 'Autorski masaż drenujący z użyciem naturalnych olejków arganowych, poprawiający mikrokrążenie i wygładzający skórę.', 150.00, 50),
('Kompleksowa pielęgnacja cery (Głębokie oczyszczanie)', 'Wieloetapowy zabieg oczyszczania wodorowego, tonizacja, maska algowa i odżywcze serum z kwasem hialuronowym.', 220.00, 90)
ON CONFLICT DO NOTHING;

-- Seed sample initial appointment for demonstration
INSERT INTO appointments (customer_name, customer_email, customer_phone, service_id, appointment_date, appointment_time, notes, status) VALUES
('Katarzyna Nowak', 'katarzyna.nowak@example.com', '+48 600 123 456', 1, CURRENT_DATE + INTERVAL '1 day', '12:00', 'Pierwsza wizyta w salonie.', 'potwierdzona'),
('Piotr Wiśniewski', 'piotr.wisniewski@example.com', '+48 501 987 654', 2, CURRENT_DATE + INTERVAL '2 days', '15:30', 'Prośba o stylizację brody.', 'potwierdzona')
ON CONFLICT DO NOTHING;
