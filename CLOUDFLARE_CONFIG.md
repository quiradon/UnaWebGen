# Configuração do Cloudflare para Resolver Avisos de Preload

## Problema
Os avisos no console acontecem porque o Cloudflare Rocket Loader está interferindo com os módulos ES6 do Astro que requerem credenciais para a API de sessão.

## Solução no Cloudflare Dashboard

### 1. Desabilitar Rocket Loader (Recomendado)
1. Acesse o dashboard do Cloudflare
2. Vá em **Speed** → **Optimization**
3. Encontre **Rocket Loader™**
4. Defina como **Off** ou crie uma Page Rule para desabilitar em páginas específicas

### 2. Alternativa: Page Rule para Scripts Específicos
Se quiser manter o Rocket Loader ativo:

1. Acesse **Rules** → **Page Rules**
2. Crie uma nova regra:
   - URL: `rpg.arkanus.app/_astro/*.js`
   - Settings: **Rocket Loader** → **Off**
3. Salve a regra

### 3. Configurar Headers CORS
1. Acesse **Rules** → **Transform Rules** → **HTTP Response Header Modification**
2. Crie uma nova regra para `/_astro/*`:
   - **Set Header**: `Access-Control-Allow-Origin` = `https://rpg.arkanus.app`
   - **Set Header**: `Access-Control-Allow-Credentials` = `true`
   - **Set Header**: `Timing-Allow-Origin` = `https://rpg.arkanus.app`

## Arquivo _headers
O arquivo `public/_headers` já foi criado com as configurações adequadas.
Certifique-se de que o Cloudflare está processando esse arquivo corretamente.

## Verificação
Após aplicar as mudanças:
1. Limpe o cache do Cloudflare
2. Faça hard refresh no navegador (Ctrl+F5)
3. Verifique se os avisos desapareceram no console

## Observações
- O Rocket Loader é útil para sites com muitos scripts síncronos antigos
- Para aplicações modernas com ES6 modules (como Astro), é melhor desabilitá-lo
- Os módulos já são otimizados e carregados assincronamente pelo Astro/Vite
