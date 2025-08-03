-- Adicionar campo destaque na tabela noticias
ALTER TABLE noticias ADD COLUMN destaque BOOLEAN DEFAULT FALSE;

-- Criar índice para melhor performance nas consultas de notícias em destaque
CREATE INDEX idx_noticias_destaque ON noticias(destaque, data DESC);

-- Comentário explicativo
COMMENT ON COLUMN noticias.destaque IS 'Indica se a notícia deve aparecer como destaque na página inicial';