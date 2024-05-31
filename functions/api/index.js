export async function onRequest(context) {
  console.log(context.env)
  console.log(context.env.una_db)
    let tentativa = context.env.db.prepare('SELECT * FROM test')
    let data = await tentativa.first()
    console.log(data)
    return new Response("Hello, world!")
  }

