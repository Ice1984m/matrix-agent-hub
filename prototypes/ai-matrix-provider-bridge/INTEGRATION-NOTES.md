# AI Matrix integration notes

This repository currently hosts a provider-bridge prototype under `prototypes/ai-matrix-provider-bridge`.

The full Windows AI Matrix application is maintained separately at the user's local project path. This GitHub branch is a prototype snapshot, not a claim that the local application has been fully synchronized or deployed.

Before production:
1. Integrate the adapter into the authenticated HTTPS API.
2. Store provider keys in the deployment host's secret manager.
3. Configure a strong API bearer token and TLS reverse proxy.
4. Verify current model IDs and account access with real credentials.
5. Run integration tests using controlled provider test accounts and budget limits.
6. Connect a OnePlus device through ADB and run device-level tests.
7. Review release signing and Google Play requirements.

No keys, tokens, certificates, or private configuration files belong in this repository.
