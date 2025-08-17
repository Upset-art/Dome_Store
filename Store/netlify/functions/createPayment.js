const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  try {
    // Vérifier que la requête est POST
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Méthode non autorisée" }),
      };
    }

    // Récupérer les données envoyées par le client
    const { amount, description, callback_url } = JSON.parse(event.body);

    // Clés PayDunya stockées dans Netlify
    const PUBLIC_KEY = process.env.PAYDUNYA_PUBLIC_KEY;
    const PRIVATE_KEY = process.env.PAYDUNYA_PRIVATE_KEY;
    const TOKEN = process.env.PAYDUNYA_TOKEN;

    // Créer une facture chez PayDunya
    const response = await fetch("https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "PAYDUNYA-PUBLIC-KEY": PUBLIC_KEY,
        "PAYDUNYA-PRIVATE-KEY": PRIVATE_KEY,
        "PAYDUNYA-MASTER-KEY": PRIVATE_KEY,
        "PAYDUNYA-TOKEN": TOKEN,
      },
      body: JSON.stringify({
        invoice: {
          items: [
            {
              name: description || "Paiement Store",
              quantity: 1,
              unit_price: amount,
              total_price: amount,
            },
          ],
          total_amount: amount,
          description: description || "Paiement Mobile Money",
        },
        store: {
          name: "Domè Store",
          tagline: "Paiements rapides et sécurisés",
        },
        actions: {
          cancel_url: "https://domestore.netlify.app/store",
          return_url: callback_url || "https://domestore.netlify.app/merci",
        },
      }),
    });

    const data = await response.json();

    if (data.response_code === "00" && data.response_text && data.response_text.checkout_url) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Facture créée avec succès",
          redirectUrl: data.response_text.checkout_url,
        }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: data.response_text || data }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};