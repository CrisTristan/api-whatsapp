import { createBot, createProvider, createFlow, MemoryDB, addKeyword} from "@bot-whatsapp/bot"
import {BaileysProvider, handleCtx} from "@bot-whatsapp/provider-baileys"

//  const flowAgradecimineto = addKeyword(['Ok', 'Ok gracias', 'Enterado']).addAnswer('Pase buen Dia')

const main = async () =>{

    const provider = createProvider(BaileysProvider)

    provider.initHttpServer(3002)

    provider.http?.server.post('/send-message', handleCtx( async (bot, req, res)=>{
        const { number: phoneNumber, message } = req.body;

        // Validación de phoneNumber
        const isValidPhoneNumber = typeof phoneNumber === 'string' && /^\d{10}$/.test(phoneNumber);
        
        if (!isValidPhoneNumber) {
            return res.end('El número debe ser numérico y tener 10 dígitos.');
        }

        // Validación de message
        if (typeof message !== 'string' || message.trim() === '') {
            return res.end('El mensaje no puede estar vacío.');
        }

        try {
            const sendMessage = await bot.sendMessage(phoneNumber, message, {});
            console.log(sendMessage);
            res.end('Mensaje enviado correctamente');
        } catch (error) {
            console.error(error);
            res.end('Error al enviar el mensaje');
        }
    }))

    // await createBot({
    //     flow: createFlow([flowAgradecimineto]),
    //     database: new MemoryDB(),
    //     provider
    // })
}

main()