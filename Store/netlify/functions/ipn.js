// netlify/functions/ipn.js
const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ error: "Méthode non autorisée" }) };
    }

    const payload = JSON.parse(event.body);
    console.log("📩 Notification IPN reçue:", payload);

    // Configurer Nodemailer pour envoi d'email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    if (payload.status === "completed") {
      console.log("✅ Paiement validé:", payload.invoice);

      // Envoi email au client
      if (payload.invoice.customer_email) {
        await transporter.sendMail({
          from: `"Domè Store" <${process.env.SMTP_USER}>`,
          to: payload.invoice.customer_email,
          subject: `Votre commande Domè Store`,
          text: `Merci pour votre commande !\nMontant : ${payload.invoice.total_amount} FCFA\nProduits : ${payload.invoice.description}\nLien de paiement : ${payload.response_text}`,
        });
      }

      // Envoi email à l'admin pour produits à livrer directement
      await transporter.sendMail({
        from: `"Domè Store" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `Nouvelle commande reçue`,
        text: `Client : ${payload.invoice.customer_name || "N/A"}\nMontant : ${payload.invoice.total_amount} FCFA\nProduits : ${payload.invoice.description}\nIPN token : ${payload.token}`,
      });

      // Ici tu peux également stocker la commande dans Firestore si tu veux
    } else if (payload.status === "cancelled") {
      console.log("❌ Paiement annulé:", payload.invoice);
    }

    return { statusCode: 200, body: JSON.stringify({ message: "IPN traité avec succès" }) };
  } catch (error) {
    console.error("Erreur IPN:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
