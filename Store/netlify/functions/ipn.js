// netlify/functions/ipn.js
exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Méthode non autorisée" }),
      };
    }

    // Récupérer les données envoyées par PayDunya
    const payload = JSON.parse(event.body);

    console.log("📩 Notification IPN reçue:", payload);

    // Exemple : vérifier le statut
    if (payload.status === "completed") {
      // Tu peux stocker l’info en DB, envoyer un email, etc.
      console.log("✅ Paiement validé:", payload.invoice);
    } else if (payload.status === "cancelled") {
      console.log("❌ Paiement annulé:", payload.invoice);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "IPN reçu avec succès" }),
    };
  } catch (error) {
    console.error("Erreur IPN:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
