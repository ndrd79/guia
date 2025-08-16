-- Adicionar coluna decoration_type na tabela seasonal_themes
ALTER TABLE seasonal_themes 
ADD COLUMN decoration_type VARCHAR(50) DEFAULT 'none';

-- Atualizar os temas existentes com decorações apropriadas
UPDATE seasonal_themes 
SET decoration_type = CASE 
    WHEN LOWER(name) LIKE '%natal%' OR LOWER(name) LIKE '%christmas%' THEN 'snowflakes'
    WHEN LOWER(name) LIKE '%halloween%' THEN 'bats'
    WHEN LOWER(name) LIKE '%dia das mães%' OR LOWER(name) LIKE '%mother%' THEN 'hearts'
    WHEN LOWER(name) LIKE '%dia dos pais%' OR LOWER(name) LIKE '%father%' THEN 'stars'
    WHEN LOWER(name) LIKE '%namorados%' OR LOWER(name) LIKE '%valentine%' THEN 'hearts'
    WHEN LOWER(name) LIKE '%páscoa%' OR LOWER(name) LIKE '%easter%' THEN 'flowers'
    WHEN LOWER(name) LIKE '%festa junina%' OR LOWER(name) LIKE '%june%' THEN 'stars'
    ELSE 'none'
END;

-- Adicionar comentário na coluna
COMMENT ON COLUMN seasonal_themes.decoration_type IS 'Tipo de decoração: none, hearts, snowflakes, bats, stars, flowers, pumpkins';