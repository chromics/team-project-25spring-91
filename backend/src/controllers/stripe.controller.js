// backend/src/controllers/stripe.controller.js
const stripeService = require('../services/stripe.service');

const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = await stripeService.constructEvent(req.body, sig);
    await stripeService.handleStripeEvent(event);
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook Error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

const createCheckoutSession = async (req, res) => {
  try {
    const session = await stripeService.createCheckoutSession(req.body);
    res.json({ sessionId: session.id });
  } catch (err) {
    console.error('Checkout Session Error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  handleWebhook,
  createCheckoutSession
};