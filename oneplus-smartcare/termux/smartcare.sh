#!/data/data/com.termux/files/usr/bin/bash
set -u
umask 077
SHARED="$HOME/storage/shared"
DOWNLOAD="$SHARED/Download"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$DOWNLOAD/SmartCare-Security-rapport-$STAMP.txt"
INV="$DOWNLOAD/SmartCare-Security-Inventory.txt"
if [ ! -d "$DOWNLOAD" ]; then echo 'Opslag niet beschikbaar. Voer termux-setup-storage uit.'; exit 1; fi
{
 echo 'ONEPLUS SMARTCARE SECURITY SUITE'
 echo "Datum: $(date)"
 echo 'Modus: alleen lezen; originele bestanden blijven behouden.'
 echo '== INVENTARIS =='
 if [ -f "$INV" ]; then echo "Gevonden: $INV"; sha256sum "$INV"; else echo "Niet gevonden: $INV"; fi
 echo '== APPARAAT =='
 printf 'Model: '; getprop ro.product.model 2>/dev/null || true
 printf 'Android: '; getprop ro.build.version.release 2>/dev/null || true
 echo '== BESTANDEN =='
 for rel in Download Documents DCIM Pictures Movies Android/media; do
  dir="$SHARED/$rel"; echo "-- $rel --"
  if [ -d "$dir" ]; then find "$dir" -type f -printf '%s bytes | %p\\n' 2>/dev/null | head -n 5000; else echo 'Niet beschikbaar of geen toegang.'; fi
 done
 echo '== APK- EN SCRIPTCONTROLE =='
 find "$DOWNLOAD" -type f \\( -iname '*.apk' -o -iname '*.sh' -o -iname '*.py' -o -iname '*.js' -o -iname '*.jar' \\) -print0 2>/dev/null | while IFS= read -r -d '' f; do echo "-- $f"; sha256sum "$f" 2>/dev/null || true; file "$f" 2>/dev/null || true; done
 echo 'SHA-256 is geen malwaredetectie.'
 echo 'Geen bestanden uitgevoerd, geïnstalleerd, gewijzigd of verwijderd.'
 echo 'SCAN VOLTOOID'
} > "$OUT"
chmod 600 "$OUT"
echo "Scan voltooid: $OUT"
