# Monitoramento de Consumo de IA (SQL)

Este documento contém as principais consultas SQL para monitorar o uso de tokens e modelos de IA no Nutrixo, utilizando a tabela `nutrixo_ai_logs` no Supabase.

### 1. Visão Geral Cronológica
Finalidade: Ver todos os registros de uso da IA em ordem cronológica inversa, permitindo acompanhar em tempo real as chamadas feitas e o gasto de cada uma.

```sql
SELECT * 
FROM nutrixo_ai_logs 
ORDER BY created_at DESC;
```

### 2. Resumo de Gasto por Modelo
Finalidade: Analisar qual modelo de IA (ex: Gemma, Gemini, Llama) está sendo mais utilizado e qual o impacto total de tokens (prompt, resposta e total) para cada um.

```sql
SELECT 
    model_used, 
    COUNT(*) as total_calls,
    SUM(prompt_tokens) as total_prompt_tokens,
    SUM(completion_tokens) as total_completion_tokens,
    SUM(total_tokens) as grand_total_tokens
FROM nutrixo_ai_logs
GROUP BY model_used
ORDER BY grand_total_tokens DESC;
```

### 3. Consumo por Funcionalidade
Finalidade: Identificar quais funções do aplicativo (ex: análise de fotos, chat, extração de exames) são as mais "caras" em termos de tokens, ajudando na otimização de prompts e custos.

```sql
SELECT 
    function_name, 
    model_used,
    COUNT(*) as calls,
    AVG(total_tokens) as avg_tokens_per_call,
    SUM(total_tokens) as total_tokens_spent
FROM nutrixo_ai_logs
GROUP BY function_name, model_used
ORDER BY total_tokens_spent DESC;
```

### 4. Últimas Atividades por Usuário
Finalidade: Monitorar a atividade recente de um usuário específico, verificando o que ele está usando e quanto de recurso está consumindo.

```sql
SELECT created_at, function_name, model_used, total_tokens
FROM nutrixo_ai_logs
WHERE user_email = 'seu-email@exemplo.com'
ORDER BY created_at DESC
LIMIT 10;
```
