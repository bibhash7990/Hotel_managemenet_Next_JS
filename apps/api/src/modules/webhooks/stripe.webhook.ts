import { Router, raw } from 'express';
import Stripe from 'stripe';
import type { Env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import {
  confirmBookingPaymentFromIntent,
  markPaymentFailedForIntent,
} from '../bookings/bookings.service.js';

export function createStripeWebhookRouter(env: Env): Router {
  const r = Router();
  r.post('/', raw({ type: 'application/json' }), async (req, res) => {
    if (!env.STRIPE_WEBHOOK_SECRET || !env.STRIPE_SECRET_KEY) {
      res.status(503).send('Stripe not configured');
      return;
    }
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    if (typeof sig !== 'string') {
      res.status(400).send('Missing signature');
      return;
    }
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      logger.warn({ err }, 'Stripe webhook signature failed');
      res.status(400).send('Bad signature');
      return;
    }

    try {
      if (event.type === 'payment_intent.succeeded') {
        const pi = event.data.object as Stripe.PaymentIntent;
        const bookingId = pi.metadata?.bookingId;
        if (!bookingId) {
          res.json({ received: true });
          return;
        }
        await confirmBookingPaymentFromIntent(env, {
          bookingId,
          paymentIntentId: pi.id,
          amountReceivedCents: pi.amount_received,
          currency: pi.currency,
        });
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId ?? session.client_reference_id ?? undefined;
        const piId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id;
        if (bookingId && piId && session.amount_total != null) {
          await confirmBookingPaymentFromIntent(env, {
            bookingId,
            paymentIntentId: piId,
            amountReceivedCents: session.amount_total,
            currency: session.currency ?? 'usd',
          });
        }
      }

      if (event.type === 'payment_intent.payment_failed') {
        const pi = event.data.object as Stripe.PaymentIntent;
        await markPaymentFailedForIntent(pi.id);
      }
    } catch (err) {
      logger.error({ err, type: event.type }, 'Stripe webhook handler error');
      res.status(500).send('Handler error');
      return;
    }

    res.json({ received: true });
  });
  return r;
}
