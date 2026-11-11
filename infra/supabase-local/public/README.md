# External credential probe: review packet

Status: owner authorized the limited experiment on 2026-10-14. An IP certificate
was issued; the first publication was rolled back after Windows/Python TLS
validation failed. The gateway is stopped, the two router/firewall rules removed,
and configuration restored to loopback. The certificate is retained privately.
Renewal and ChatGPT Preview remain unverified. Earlier 15 HTTPS loopback checks
and five HTTP-01 routing checks passed. See [experiment and rollback](experiment-20261014.json).
This packet publishes
only the read-only `auth/whoami` route. It does not expose Supabase Studio, Meta,
PostgreSQL, Auth, Data API, MCP, or persona-memory routes. Local IskraSpace keeps
using `http://127.0.0.1:18000`.

Project: `iskra-gateway-20261014`, separate from the backend project. Image tags
and registry digests are pinned in `compose.gateway.yml`. Gateway joins only the
fixed backend network `iskra-supabase-local-20261014_default`; Certbot does not
join it. No Docker socket is mounted.

## Private preparation

The protected directory `E:/IskraSupabase/iskra-gateway-20261014` is prepared with
owner/SYSTEM access, outside Git. Its `smoke/` and `production/` directories each
have separate `acme`, `letsencrypt`, and `logs` children. Do not use a Git directory
or a symlink/junction. The production store now holds the issued IP certificate.

`smoke.env` points only at `smoke/`, which contains a temporary self-signed
loopback certificate. `production.env` points only at `production/`. Both copy
only the verified `ANON_KEY`, never the service-role key. They currently retain
loopback bindings. The actual public IP exists only in this private state.
For a new deployment, populate these values privately:

```dotenv
ISKRA_PUBLIC_STATE_DIR=E:/IskraSupabase/iskra-gateway-20261014/production
ISKRA_PUBLIC_IP=REPLACE_WITH_YOUR_PUBLIC_IPV4
ISKRA_PUBLIC_ANON_KEY=REPLACE_WITH_VERIFIED_LOCAL_ANON_KEY
CERTBOT_EMAIL=
ISKRA_PUBLIC_BIND_HOST=127.0.0.1
ISKRA_PUBLIC_HTTP_PORT=18080
ISKRA_PUBLIC_HTTPS_PORT=18443
```

An optional account email enables CA account notifications. An empty value uses
Certbot's no-email registration option. Certificate issuance explicitly accepts
the CA terms via `--agree-tos`; it belongs to the approved public activation.
Never print raw interpolated Compose config or certificate logs into chat.

PowerShell command prefix, from the repository root:

```powershell
$gatewayCompose = @('--context', 'desktop-linux', 'compose', '--project-name', 'iskra-gateway-20261014', '--env-file', 'E:/IskraSupabase/iskra-gateway-20261014/production.env', '-f', 'infra/supabase-local/public/compose.gateway.yml')
docker @gatewayCompose --profile bootstrap config --quiet
```

Bootstrap serves only existing HTTP-01 challenge files; every other public path
returns 404. Its `/healthz` listener is container-loopback only. The TLS service
requires existing certificate files and a syntactically valid anon-role key.
For the loopback rehearsal, root can create a temporary private test certificate;
that proves configuration and route filtering, not public certificate trust.
The observed checks are in [loopback-verification.json](loopback-verification.json)
and [bootstrap-verification.json](bootstrap-verification.json). They used only
`smoke.env`; no CA account or public certificate was created. Never issue a CA
certificate into the smoke store or copy its test certificate into production.

## Approved public activation

1. Verify this is the intended computer and reserve its current LAN address.
   Approve Windows firewall and router TCP 80/443 forwarding to that computer.
2. Confirm `production.env` points to the distinct production certificate store.
   It must be empty for first issuance; after this experiment, inspect and reuse
   the valid fixed lineage instead of copying a smoke certificate. In that
   private file, set the reviewed LAN bind address, HTTP port `80` and HTTPS port
   `443`. Recreate bootstrap, and verify HTTP-01 reachability from outside LAN.
3. Issue the certificate. Before starting TLS, inspect the resulting fixed
   `live/iskra-public-ip` lineage, IP SAN, validity and certificate chain. Stop
   bootstrap before TLS uses its HTTP port, then start TLS and renewal:

```powershell
docker @gatewayCompose --profile bootstrap up -d --force-recreate bootstrap
docker @gatewayCompose run --rm certbot issue
docker @gatewayCompose --profile bootstrap stop bootstrap
docker @gatewayCompose --profile tls up -d gateway
docker @gatewayCompose run --rm certbot check-renew
docker @gatewayCompose --profile certificate up -d certbot
```

Certificate IP SAN, trusted chain and validity must be observed from an external
client. IP certificates require the `shortlived` ACME profile, approximately
160-hour validity. The renewal worker runs every 12 hours; nginx watches the
certificate/key every 30 seconds and reloads only after `nginx -t` succeeds.
HTTP-01 needs public port 80 during renewal as well as initial issuance; keep
only existing ACME challenge files reachable. Run the renewal dry-run before
starting periodic Certbot to avoid contention on its shared configuration locks.
Renewal failures produce a generic operational message; private Certbot logs
remain outside Git. Computer shutdown, loss of WAN/forwarding, or a stopped
renewal worker can prevent renewal. Verify the scheduled worker remains running
and rehearse renewal before declaring the external endpoint ready.

## ChatGPT / Builder verification

Create a private copy of `openapi-probe.json`; replace its documentation-only
server address with the verified `https://<PUBLIC_IP>`. Import that copy into
the intended Actions surface. Configure Bearer authentication in its private UI
using the approved probe credential. Do not upload credentials in the schema.
The proxy injects the public anon `apikey` header and preserves caller Bearer
authorization, so the Action need not configure a separate custom `apikey` header.

Confirm a real Preview call returns `ok: true`, `mode: probe_only` and the expected
credential class. Missing/invalid Bearer must return 401. GET, memory paths,
`/rest/v1`, `/auth/v1`, `/pg`, `/mcp`, Studio paths and all other routes return 404.
OPTIONS is forwarded only for the exact probe route. Access logs are disabled;
request headers and bodies are not added to operational logs. This REST probe
does not establish MCP connectivity or enable persona-memory persistence.
The backend's derived Edge main additionally avoids serializing JWT verification
errors; a signed expired canary check passed. This is a specific logging check,
not a general assertion that every backend log is free of personal data.

Envoy overwrites `X-Real-IP` with its TCP peer. Through this proxy that peer is
nginx; the current probe does not use AI quotas. Publishing AI routes would need
a reviewed trusted-proxy design to keep per-client quota identity meaningful.
The HTTP healthcheck only proves process readiness, not certificate trust or
expiry. Do not declare external readiness without certificate and renewal checks.

## TLS diagnosis from the rolled-back experiment

The four served production certificates are valid, and the peer fingerprint
matches the expected leaf. Strict Node validation passed with TLS 1.3. Windows
Python's default store failed with expiry code 10; it contains an old Root X2
cross-certificate expired in September 2025. A per-connection check using the
existing valid Root X1 in RAM passed with CERT_REQUIRED, hostname/IP verification
and X509_STRICT retained. This isolates the failure to client trust-path handling.
The system trust store was not changed. Do not disable verification or trust an
arbitrary leaf to proceed. Neither local result proves outside-LAN HTTPS or GPT
Actions compatibility; those checks are still pending the chosen client surface.

## Rollback

Stop only this gateway project and remove the approved router/firewall rules:

```powershell
docker @gatewayCompose --profile bootstrap --profile tls --profile certificate stop
```

Retain protected certificate/account files for inspection; no deletion is part
of rollback. Backend containers, volumes and local IskraSpace remain independent.

Evidence: [Certbot 5.8 user guide](https://eff-certbot.readthedocs.io/en/stable/using.html),
[Let's Encrypt IP certificates with Certbot](https://letsencrypt.org/2026/03/11/shorter-certs-certbot/).
