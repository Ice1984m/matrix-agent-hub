# Security scope

This is an initial local integrity and encryption prototype, not antivirus and not complete device hardening. It does not claim malware verdicts or inspect APK signatures.

AES-GCM uses a platform-generated IV for each encryption. The Android Keystore key is non-exportable. Encrypted output is stored in app-private storage. This prototype does not yet provide decryption, recovery, or export; do not use it as the only copy of important data.

Never commit passwords, private keys, recovery phrases, personal inventory reports, or device identifiers.
