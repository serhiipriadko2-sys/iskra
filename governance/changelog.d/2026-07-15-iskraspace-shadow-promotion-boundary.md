# IskraSpace Shadow Promotion Boundary

- Routed the current `ShadowView` promotion action through deterministic preflight,
  scoped one-use consent, read-back verification, and a persistent action receipt.
- Added behavioral tests proving policy denial keeps the record in Shadow and prevents
  the raw storage mutation.
- Preserved historical consent receipts so action permission references remain
  auditable after later confirmations.
- Marked `CR-P0-04` repository-integrated/tested only; deployment, live invocation,
  complete runtime enforcement, and canonical activation remain unclaimed.
- Kept Memory Gateway, Custom GPT Actions, and Supabase live state unchanged.
