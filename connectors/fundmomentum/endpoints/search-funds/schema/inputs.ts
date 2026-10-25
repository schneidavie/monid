import { z } from "zod";

/**
 * `search_funds` tool arguments (fundmomentum.vc, RE-VERIFIED LIVE
 * 2026-10-24/25 against the vendor's own tool schema — see provider.ts
 * for the earlier 2026-10-17 billing correction). Mirror carries
 * optionality only (D25): the vendor normalizes common spellings of
 * `stage`/`industry` server-side ("Pre-Seed" → `pre_seed`, "AI/ML" →
 * `ai_ml`), so this stays a plain string rather than a fabricated closed
 * enum — the real enum is not published. `country` is spelled out in
 * full here (not an ISO code, per the vendor's own docs).
 *
 * `limit` — CHANGED 2026-10-24 ("safe default limit" fix): omitting it
 * now defaults to 10 for EVERY caller, including an agent paying on
 * credits (this connector's first PR, and its 2026-10-17 correction,
 * both still said omitting it returned every match within the day's
 * allowance — that was true before this date and is not anymore).
 * The tier ceiling above the default is unchanged and still
 * REJECTED, not clamped, when exceeded: free/keyless max 10/call,
 * Starter max 50/call, Pro max 250/call with `offset` paging, and an
 * agent-credits key up to 150 funds per key per UTC day in total
 * (across calls — not a per-call cap). Only a floor of 1 is enforced
 * client-side at the binding in endpoint.ts; everything above is the
 * vendor's own rejection. `z.looseObject`: vendor-forward keys ride
 * through.
 */
export const zFundmomentumSearchFundsArgs = z.looseObject({
    stage: z.string().describe(
        "Funding stage, e.g. 'seed', 'pre_seed', 'series_a'. Common " +
            "spellings ('Pre-Seed') are normalized server-side.",
    ).optional(),
    country: z.string().describe(
        "Fund HQ country, spelled out in full (e.g. 'Germany'), not " +
            "an ISO code.",
    ).optional(),
    industry: z.string().describe(
        "Investment focus, e.g. 'ai_ml', 'climate_sustainability', " +
            "'b2b_saas'. Common spellings ('AI/ML') are normalized " +
            "server-side.",
    ).optional(),
    closed_since: z.string().describe(
        "Only funds whose latest published close (first, interim or " +
            "final close, or a launch) is on or after this date, ISO " +
            "'YYYY-MM-DD' (e.g. '2026-09-01'). Results then come " +
            "newest close first.",
    ).optional(),
    limit: z.number().int().describe(
        "Maximum number of funds to return. Defaults to 10 if omitted " +
            "— for every caller, including on credits (changed " +
            "2026-10-24; it used to return every match within the " +
            "day's allowance). Free/keyless max 10/call, Starter max " +
            "50/call, Pro max 250/call (page with 'offset'), and " +
            "agent-credits callers are additionally capped at 150 " +
            "funds per key per UTC day in total. A value above the " +
            "caller's ceiling is rejected, not clamped. The response's " +
            "`matched` and `truncated` say whether more exist.",
    ).optional(),
    offset: z.number().int().nonnegative().describe(
        "Number of matches to skip, for paging a truncated result " +
            "(use `next_offset` from the previous response). Agent " +
            "credits and Pro plans only; ignored on the free tier.",
    ).optional(),
});
