const {nav, footer} = require('../../../components/navbar')
const {traduz} = require('../../../translation')
function page () {

  return `
<!DOCTYPE html>
<html lang="pt" data-bs-theme="dark">
<body>
    <section class="mb-5 pb-5">
    <div class="container mt-5 pt-5 mb-5 pb-5">
        <h1 class="display-1 fw-bold text-center text-primary pt-5 mt-5">400004</h1>
        <p class="text-capitalize fs-4 text-center"></p>
    </div>
</body>
`
}

export function onRequest(context) {
    const item = context.params.item;
    return new Response(
      page(),
        {
            headers: {
                "content-type": "text/html; charset=UTF-8",
            },
        }
        
    );
  }

  // npx wrangler d1 execute fortuna --remote  --command="SELECT * from itens"
