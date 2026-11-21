# OnePlus SmartCare Security Suite

Open-source Android and Termux companion for OnePlus devices.

Android app: user-selected file SHA-256 and AES-256-GCM encrypted copy using Android Keystore. Termux tool: read-only inventory and integrity report.

Safety: no broad storage permission; originals are never modified or deleted; encrypted copies are separate; SHA-256 is integrity only, not malware detection; APKs and scripts are inventoried, never executed.

Build the Android app by opening android/ in Android Studio or running gradle assembleDebug in that directory. GitHub Actions workflow will build a debug APK artifact. No APK has yet been built or installed by this source commit.

Termux scanner checks Download/SmartCare-Security-Inventory.txt if present, and writes a new timestamped report without overwriting the existing inventory. Inventory contents have not been assumed or fabricated.

MIT license.