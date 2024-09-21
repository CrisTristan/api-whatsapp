import { createBot, createProvider, createFlow, MemoryDB, addKeyword} from "@bot-whatsapp/bot"
import {BaileysProvider, handleCtx} from "@bot-whatsapp/provider-baileys"

 const flowAgradecimineto = addKeyword(['Ok', 'Ok gracias', 'Enterado']).addAnswer('Pase buen Dia')

const main = async () =>{

    const provider = createProvider(BaileysProvider)

    provider.initHttpServer(3002)

    provider.http?.server.post('/send-message', handleCtx( async (bot, req, res)=>{
        const body = req.body
        const number = body.number
        const message = body.message
        await bot.sendMessage(number, message, {})
        res.end("mensaje Enviado");
    }))

    await createBot({
        flow: createFlow([flowAgradecimineto]),
        database: new MemoryDB(),
        provider
    })
}

main()