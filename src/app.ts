import { createBot, createProvider, createFlow, MemoryDB, addKeyword } from "@bot-whatsapp/bot"
import { BaileysProvider, handleCtx } from "@bot-whatsapp/provider-baileys"
import schedule from "node-schedule";

const flowConfirmacion = addKeyword(['Confirmar']).addAnswer('Su cita ha sido Confirmada con exito');
const flowCancelacion = addKeyword(['Cancelar']).addAnswer('Su cita ha sido Cancelada con exito');

const main = async () => {

    const provider = createProvider(BaileysProvider)

    provider.initHttpServer(3002)

    provider.http?.server.post('/send-message', handleCtx(async (bot, req, res) => {
        const { phoneNumber, message, date, time } = req.body;

        // Validación de phoneNumber
        const isValidPhoneNumber = typeof phoneNumber === 'string' && /^\d{10}$/.test(phoneNumber);

        if (!isValidPhoneNumber) {
            return res.end('El número debe ser numérico y tener 10 dígitos.');
        }
        
        if (date) {
            const targetDate = new Date(date); // Meses son 0-indexados, 11 = diciembre

            if (isNaN(targetDate.getTime())) {
                return res.status(400).end('La fecha proporcionada no es válida');
            }

            const localTargetDate = new Date(
                targetDate.getFullYear(),
                targetDate.getMonth(),
                targetDate.getDate()
            );

            // Calcular un día antes
            const dayBefore = new Date(localTargetDate);
            dayBefore.setDate(localTargetDate.getDate() - 1);

            // Programar el mensaje para las 9:00 AM del día antes
            const sendTime = new Date(dayBefore);
            sendTime.setHours(9, 0, 0, 0); // Establece la hora local en punto

            console.log(`Mensaje programado para: ${sendTime}`);

            // Usar node-schedule para ejecutar la tarea
            schedule.scheduleJob(sendTime, async () => {
                
                const reminder = `Le recordamos que su cita con el dentista es el dia ${date}
                a las ${time}, con el doctor Joselito favor de confirmar su cita escribiendo 
                "Confirmar" a continuación o si prefiere "Cancelar" para cancelar la cita`

                try {
                    const sendMessage = await bot.sendMessage(phoneNumber, reminder, {});
                    console.log(sendMessage);
                    res.end('Mensaje enviado correctamente');
                } catch (error) {
                    console.error(error);
                    res.end('Error al enviar el mensaje');
                }
            });

           return res.end('Mensaje programado correctamente');
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

    await createBot({
        flow: createFlow([flowConfirmacion]),
        database: new MemoryDB(),
        provider
    })

    await createBot({
        flow: createFlow([flowCancelacion]),
        database: new MemoryDB(),
        provider
    })
}

main()