const {nav, footer} = require('../../../components/navbar')
const {traduz} = require('../../../translation')
//de um fetch no ip localhost:11001/itens

function page (list) {
    console.log(list)
    let cards = list.map(item => {
        return `
        <a href="/pt/wiki/${item.name}" class="list-group-item list-group-item-action">${item.name}</a>
        `
    }).join('')
  return `
<!DOCTYPE html>
<html lang="pt" data-bs-theme="dark">
<body>
    <section class="mb-5 pb-5">
    <div class="container mt-5 pt-5 mb-5 pb-5">
        <div class="row">
            <div class="col-md-3">
                ${cards}
            </div>
            <div class="col-md-9">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Item</h5>
        <p class="text-capitalize fs-4 text-center"></p>
    </div>
</body>
`
}

export async function onRequest(context) {
    const itemList = await fetch('http://localhost:11001/wiki').then(response => response.json());
    const item = context.params.item;
    return new Response(
        page(itemList.data),
        {
            headers: {
            "content-type": "text/html; charset=UTF-8",
            },
        }
    );
  }

  // npx wrangler d1 execute fortuna --remote  --command="SELECT * from itens"
