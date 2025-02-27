import Stripe from "stripe";
import { Order } from "../models/index.js";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

export const handleStripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // req.body ahora contiene el Buffer
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejo del evento
  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;

        // Encuentra la orden correspondiente
        const order = await Order.findOne({
          where: { stripe_payment_intent_id: paymentIntent.id },
        });

        if (order) {
          // Actualiza el estado de pago
          await order.update({
            payment_status: "paid",
          });
          console.log(`Order ${order.id} updated to payment succeeded.`);
        } else {
          console.error(
            `Order not found for paymentIntent ${paymentIntent.id}`
          );
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;

        // Encuentra la orden correspondiente
        const order = await Order.findOne({
          where: { stripe_payment_intent_id: paymentIntent.id },
        });

        if (order) {
          // Actualiza el estado de pago
          await order.update({
            payment_status: "failed",
          });
          console.log(`Order ${order.id} updated to payment failed.`);
        } else {
          console.error(
            `Order not found for paymentIntent ${paymentIntent.id}`
          );
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).send({ received: true });
  } catch (error) {
    console.error("Error handling the webhook event:", error);
    res.status(500).send("Internal Server Error");
  }
};
