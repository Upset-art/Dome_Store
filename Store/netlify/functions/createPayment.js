const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  try {
    // Vérifier méthode
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Méthode non autorisée" }),
      };
    }

    // Corps de la requête venant du frontend
    const body = JSON.parse(event.body);

    // ⚠️ Vérifie que tu as bien ajouté ces clés dans Netlify → Site settings → Environment variables
    const MASTER_KEY = process.env.PAYDUNYA_MASTER_KEY;
    const PRIVATE_KEY = process.env.PAYDUNYA_PRIVATE_KEY;
    const TOKEN = process.env.PAYDUNYA_TOKEN;

    // Vérification que les clés existent
    if (!MASTER_KEY || !PRIVATE_KEY || !TOKEN) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Clés PayDunya manquantes dans les variables d'environnement",
        }),
      };
    }

    // Préparation des données de paiement
    const payload = {
      invoice: {
        items: [
          {
            name: body.name || "Produit",
            quantity: 1,
            unit_price: body.amount || 1000,
            total_price: body.amount || 1000,
          },
        ],
        total_amount: body.amount || 1000,
        description: "Paiement Domè Store",
      },
      store: {
        name: "Domè Store",
      },
      actions: {
        callback_url: "https://domestore.netlify.app/.netlify/functions/ipn",
        cancel_url: "https://domestore.netlify.app/store",
        return_url: "https://domestore.netlify.app/merci",
      },
    };

    // Appel API PayDunya
    const response = await fetch("https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "PAYDUNYA-MASTER-KEY": MASTER_KEY,
        "PAYDUNYA-PRIVATE-KEY": PRIVATE_KEY,
        "PAYDUNYA-TOKEN": TOKEN,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    // Log complet pour debug
    console.log("Réponse PayDunya :", result);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Erreur serveur Netlify :", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erreur interne", details: error.message }),
    };
  }
};
