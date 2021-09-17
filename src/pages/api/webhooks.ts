import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from 'stream'
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "../../lib/saveSubscription";

async function buffer(readable: Readable) {
  const chunks = []

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    )
  }

  return Buffer.concat(chunks)
}

export const config = {
  api: {
    bodyParser: false
  }
}

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.udpated',
  'customer.subscription.deleted',
])

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const buf = await buffer(req)

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        buf, 
        req.headers['stripe-signature'], 
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      return res.status(400).send(`Webhook error: ${err.message}`)
    }

    if (relevantEvents.has(event.type)) {
      try {
        switch(event.type) {
          case 'customer.subscription.udpated':
          case 'customer.subscription.deleted':
            const subscription = event.data.object as Stripe.Subscription

            await saveSubscription(
              subscription.id,
              subscription.customer.toString(),
            )

            break
          case 'checkout.session.completed':
            let checkoutSession = event.data.object as Stripe.Checkout.Session  

            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
              true
            )

            break
          default:
            throw new Error('Unhandle event')
        }
      } catch (err) {
        return res.status(500).json(`Unhandle webhook`)
      }
    }

    return res.status(200).end();
  } else {
    return res
      .status(405)
      .setHeader('Allow', 'POST')
      .end('Method not allowed')
  }
}