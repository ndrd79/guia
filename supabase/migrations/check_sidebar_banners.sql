-- Verificar banners ativos na posição Sidebar Esquerda
SELECT 
  id,
  nome,
  posicao,
  imagem,
  link,
  largura,
  altura,
  ativo,
  is_principal,
  prioridade,
  categoria,
  tipo
FROM banners 
WHERE posicao = 'Sidebar Esquerda' 
  AND ativo = true
ORDER BY prioridade DESC, created_at DESC;