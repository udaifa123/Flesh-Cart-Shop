-- Sample products (10). Safe to run more than once.
INSERT INTO products (name, price, stock, emoji) VALUES
  ('Tomatoes (1 kg)',        40.00, 50, '🍅'),
  ('Potatoes (1 kg)',        30.00, 80, '🥔'),
  ('Onions (1 kg)',          35.00, 70, '🧅'),
  ('Bananas (1 dozen)',      60.00, 40, '🍌'),
  ('Apples (1 kg)',         180.00, 25, '🍎'),
  ('Milk (1 L)',             56.00, 60, '🥛'),
  ('Eggs (1 dozen)',         84.00, 30, '🥚'),
  ('Brown Bread',            45.00,  4, '🍞'),
  ('Basmati Rice (1 kg)',   110.00, 45, '🍚'),
  ('Sunflower Oil (1 L)',   150.00, 20, '🫒')
ON CONFLICT (name) DO NOTHING;
