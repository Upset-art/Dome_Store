const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ error: "Méthode non autorisée" }) };
    }

    const { amount, description, callback_url } = JSON.parse(event.body);

    // Clés PayDunya depuis Netlify (assurez-vous que MASTER_KEY est séparé)
    const PUBLIC_KEY = process.env.PAYDUNYA_PUBLIC_KEY;
    const PRIVATE_KEY = process.env.PAYDUNYA_PRIVATE_KEY;
    const TOKEN = process.env.PAYDUNYA_TOKEN;

    const response = await fetch("https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "PAYDUNYA-PUBLIC-KEY": PUBLIC_KEY,
        "PAYDUNYA-PRIVATE-KEY": PRIVATE_KEY,
        "PAYDUNYA-TOKEN": TOKEN,
      },
      body: JSON.stringify({
        invoice: {
          items: [{ name: description || "Paiement Store", quantity: 1, unit_price: amount, total_price: amount }],
          total_amount: amount,
          description: description || "Paiement Mobile Money",
        },
        store: { name: "Domè Store", tagline: "Paiements rapides et sécurisés" },
        actions: {
          cancel_url: "https://domestore.netlify.app/store",
          return_url: callback_url || "https://domestore.netlify.app/merci",
        },
      }),
    });

    const data = await response.json();

    const checkoutUrl = data.response_checkout_url || data.response_text?.checkout_url;

    if (data.response_code === "00" && checkoutUrl) {
      return { statusCode: 200, body: JSON.stringify({ message: "Facture créée avec succès", redirectUrl: checkoutUrl }) };
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: data.response_text || data }) };
    }

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

