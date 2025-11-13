## Objetivo
- Iniciar o servidor de desenvolvimento do projeto para validação das melhorias e continuar a migração solicitada.

## Passos
- Verificar scripts disponíveis e usar `npm run dev` para iniciar o Next.js.
- Se houver erro de dependências, instalar com `npm install` e reexecutar `npm run dev`.
- Confirmar a URL de pré-visualização (geralmente `http://localhost:3000`) e disponibilizá-la.

## Verificação
- Aguardar o log de inicialização “started server … url: http://localhost:3000”.
- Abrir a pré-visualização e confirmar que rotas principais carregam.

## Continuação
- Após o servidor ativo, avançar com migração da desativação para App Router com verificação de `role=admin` e unificação do tracking dos hooks para o endpoint de slot.