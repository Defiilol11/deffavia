-- Migración: Agregar modo 'group' al constraint de reservation_order
-- Fecha: 2025-10-22
-- Descripción: Permite el modo 'group' para reservas grupales

-- Paso 1: Eliminar el constraint existente
ALTER TABLE reservation_order
DROP CONSTRAINT IF EXISTS reservation_order_mode_check;

-- Paso 2: Crear el nuevo constraint con 'group' incluido
ALTER TABLE reservation_order
ADD CONSTRAINT reservation_order_mode_check
CHECK (mode IN ('manual', 'random', 'imported', 'group'));

-- Verificar que funcionó
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'reservation_order'::regclass
  AND conname = 'reservation_order_mode_check';

-- Resultado esperado:
-- reservation_order_mode_check | CHECK (mode IN ('manual', 'random', 'imported', 'group'))
