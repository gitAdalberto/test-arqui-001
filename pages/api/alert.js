// pages/api/sendWhatsAppAlert.js
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const FROM = process.env.TWILIO_FROM
const TO = process.env.TWILIO_TO

const client = twilio(accountSid, authToken);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { temperatura, humedad } = req.body;

    try {
      const message = await client.messages.create({
        body: `⚠️ Alerta crítica:\n🌡️ Temperatura: ${temperatura} °C\n💧 Humedad: ${humedad}%`,
        from: FROM, // Número de Twilio sandbox para WhatsApp
        to: TO // Reemplaza con tu número
      });

      res.status(200).json({ success: true, sid: message.sid });
    } catch (error) {
      console.error('Error enviando mensaje de WhatsApp:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}
