-- ============================================================
-- RE-PENSA TECH — SEED (datos de prueba)
-- Se ejecuta una sola vez si no hay universidades registradas.
-- Contraseñas: Estudiante1! (estudiantes) | Admin1! (admin)
-- ============================================================

INSERT INTO universities (
  id, name, email_domain, subscription_status, subscription_start, subscription_end
) VALUES (
  'a1b2c3d4-0001-0001-0001-000000000001',
  'FundaciónUniversitaria Empresarial de Colombia',
  'uniempresarial.edu.co',
  'active',
  '2026-01-01',
  '2026-12-31'
);

INSERT INTO users (id, university_id, full_name, email, password_hash, role) VALUES
(
  'b1b2c3d4-0002-0002-0002-000000000099',
  'a1b2c3d4-0001-0001-0001-000000000001',
  'Admin Repensa',
  'admin@uniempresarial.edu.co',
  '$2b$10$E1zYbUfaQQr49FfOMSBIe.ossGjfJrhDMvC25yIUOEyHIePqy8zYm',
  'admin'
),
(
  'b1b2c3d4-0002-0002-0002-000000000001',
  'a1b2c3d4-0001-0001-0001-000000000001',
  'María Rodríguez',
  'maria.rodriguez@uniempresarial.edu.co',
  '$2b$10$YAIo7YHyOLFwcmUbHsZdaul.EVuVv6uFCPbcU1ikNmChQS34ndDuW',
  'student'
),
(
  'b1b2c3d4-0002-0002-0002-000000000002',
  'a1b2c3d4-0001-0001-0001-000000000001',
  'Carlos Mendoza',
  'carlos.mendoza@uniempresarial.edu.co',
  '$2b$10$YAIo7YHyOLFwcmUbHsZdaul.EVuVv6uFCPbcU1ikNmChQS34ndDuW',
  'student'
);

-- Imágenes de demo (cuenta pública de Cloudinary). image_public_id NULL: no se borran en destroy.
INSERT INTO products (
  id, seller_id, university_id, name, description, price, is_donation,
  category, condition, status, image_url, image_public_id
) VALUES
(
  'c1b2c3d4-0003-0003-0003-000000000001',
  'b1b2c3d4-0002-0002-0002-000000000001',
  'a1b2c3d4-0001-0001-0001-000000000001',
  'Arduino Uno R3',
  'Placa Arduino Uno R3 original. Usada un semestre en robótica. Incluye cable USB.',
  18000,
  FALSE,
  'microcontrollers',
  'good',
  'available',
  'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  NULL
),
(
  'c1b2c3d4-0003-0003-0003-000000000002',
  'b1b2c3d4-0002-0002-0002-000000000001',
  'a1b2c3d4-0001-0001-0001-000000000001',
  'Sensor HC-SR04',
  'Sensor ultrasónico de distancia. Funciona correctamente.',
  8000,
  FALSE,
  'sensors',
  'good',
  'available',
  'https://res.cloudinary.com/demo/image/upload/d_desert.jpg',
  NULL
);
