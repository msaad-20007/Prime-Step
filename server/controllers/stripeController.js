import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({ amount, currency });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
};
