ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role VARCHAR(32) NOT NULL DEFAULT 'CUSTOMER';

UPDATE users
SET role = 'CUSTOMER'
WHERE role IS NULL OR role = '';

UPDATE audiobooks a
SET product_id = NULL
WHERE product_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM products p
    WHERE p.id = a.product_id
      AND p.category <> 'CHARM'
  );

CREATE OR REPLACE FUNCTION validate_audiobook_product_charm()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.product_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM products p
    WHERE p.id = NEW.product_id
      AND p.category = 'CHARM'
  ) THEN
    RAISE EXCEPTION 'Audiobook product_id % must reference a CHARM product', NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_audiobook_product_charm ON audiobooks;

CREATE TRIGGER trg_validate_audiobook_product_charm
BEFORE INSERT OR UPDATE ON audiobooks
FOR EACH ROW
EXECUTE FUNCTION validate_audiobook_product_charm();
