import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://timba-xo-site-live.vercel.app",
  "https://timba-xo-site-live-prinxe01s-projects.vercel.app",
  "https://timba-xo-site-live-git-main-prinxe01s-projects.vercel.app",
  "http://127.0.0.1:8765",
  "http://localhost:8765",
]);

const allowedGuests = new Set(["2–4 guests", "5–8 guests", "9–15 guests", "16+ guests / event"]);
const allowedPlans = new Set(["Dinner and drinks", "Lounge table", "VVIP night out", "Birthday or celebration", "Private event enquiry"]);

const isAllowedOrigin = (origin: string) =>
  allowedOrigins.has(origin) ||
  (origin.startsWith("https://timba-xo-site-live-") && origin.endsWith("-prinxe01s-projects.vercel.app"));

const jsonResponse = (body: Record<string, unknown>, status: number, origin: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Vary": "Origin",
    },
  });

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  if (!isAllowedOrigin(origin)) return jsonResponse({ error: "Origin not allowed." }, 403, "null");
  if (req.method === "OPTIONS") return jsonResponse({ ok: true }, 200, origin);
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405, origin);

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > 10_000) return jsonResponse({ error: "Request is too large." }, 413, origin);

  try {
    const body = await req.json();
    const name = clean(body.name, 100);
    const phone = clean(body.phone, 30);
    const guests = clean(body.guests, 50);
    const plan = clean(body.plan, 80);
    const notes = clean(body.notes, 1000);
    const website = clean(body.website, 200);
    const requestId = clean(body.requestId, 36);

    if (website) return jsonResponse({ error: "Submission rejected." }, 400, origin);
    if (name.length < 2 || !/^[+0-9][0-9 ()-]{6,29}$/.test(phone) || !allowedGuests.has(guests) || !allowedPlans.has(plan) || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
      return jsonResponse({ error: "Please check the enquiry details." }, 400, origin);
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", { auth: { persistSession: false } });
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase.from("reservation_enquiries").select("id", { count: "exact", head: true }).eq("phone", phone).gte("created_at", fifteenMinutesAgo);
    if (countError) throw countError;
    if ((count ?? 0) >= 3) return jsonResponse({ error: "Too many recent enquiries. Please use WhatsApp directly." }, 429, origin);

    const { data, error } = await supabase.from("reservation_enquiries").insert({ request_id: requestId, name, phone, guests, plan, notes: notes || null }).select("id").single();
    if (error?.code === "23505") return jsonResponse({ saved: true, duplicate: true }, 200, origin);
    if (error) throw error;
    return jsonResponse({ saved: true, id: data.id }, 201, origin);
  } catch (error) {
    console.error("reservation-enquiry", error);
    return jsonResponse({ error: "The enquiry could not be saved. Please try again." }, 500, origin);
  }
});
