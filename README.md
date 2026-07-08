# Timba XO Website Concept

Responsive multi-screen website concept for Timba XO in Eldoret.

## Pages

- `outputs/index.html`
- `outputs/experience.html`
- `outputs/visit.html`

## Assets

- `outputs/styles.css`
- `outputs/app.js`
- `outputs/assets/`

## Deploying

This repo includes `vercel.json` so Vercel serves the site directly from the `outputs/` folder.

## Reservation backend

Reservation enquiries are stored in the Supabase project `timba-xo-reservations` before the guest continues to WhatsApp.

- Schema: `supabase/migrations/20260708091657_create_reservation_enquiries.sql`
- Edge Function: `supabase/functions/reservation-enquiry/index.ts`
- Public table access is disabled; validated inserts run through the Edge Function.
