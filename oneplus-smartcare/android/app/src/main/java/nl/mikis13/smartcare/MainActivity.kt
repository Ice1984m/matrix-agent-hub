package nl.mikis13.smartcare

import android.app.Activity
import android.os.Bundle
import android.content.Intent
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import java.io.File
import java.security.KeyStore
import java.security.MessageDigest
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties

class MainActivity : Activity() {
    private lateinit var status: TextView
    private var encryptSelected = false
    private val pickerRequest = 4101
    private val keyAlias = "oneplus-smartcare-aes256gcm-v1"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val panel = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(32, 32, 32, 32)
        }
        panel.addView(TextView(this).apply {
            text = "OnePlus SmartCare Security Suite\nLokale bestandscontrole"
            textSize = 22f
        })
        panel.addView(Button(this).apply {
            text = "Selecteer bestand: SHA-256"
            setOnClickListener { chooseFile(false) }
        })
        panel.addView(Button(this).apply {
            text = "Selecteer bestand: AES-256-GCM kopie"
            setOnClickListener { chooseFile(true) }
        })
        status = TextView(this).apply {
            text = "Selecteer zelf een bestand. Geen brede opslagtoegang vereist."
            textSize = 15f
        }
        panel.addView(status)
        setContentView(ScrollView(this).apply { addView(panel) })
    }

    private fun chooseFile(encrypt: Boolean) {
        encryptSelected = encrypt
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        startActivityForResult(intent, pickerRequest)
    }

    @Deprecated("Legacy callback; replace with Activity Result API in a later release")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != pickerRequest || resultCode != RESULT_OK) return
        val uri = data?.data ?: return
        try {
            val bytes = contentResolver.openInputStream(uri)?.use { it.readBytes() }
                ?: error("Bestand niet leesbaar")
            require(bytes.size <= 25 * 1024 * 1024) { "Maximaal 25 MiB in deze prototypeversie" }
            val hash = MessageDigest.getInstance("SHA-256").digest(bytes)
                .joinToString("") { "%02x".format(it) }
            if (!encryptSelected) {
                status.text = "SHA-256:\n$hash\n\nIntegriteitscontrole, geen malwarecontrole."
            } else {
                val encrypted = encrypt(bytes)
                val output = File(filesDir, "smartcare-${System.currentTimeMillis()}.scs")
                output.writeBytes(encrypted)
                status.text = "SHA-256 bron: $hash\nVersleutelde kopie in app-private opslag: ${output.name}\nOrigineel ongewijzigd. Export en herstel volgen in een latere versie."
            }
        } catch (e: Exception) {
            status.text = "Fout: ${e.message ?: "onbekend"}"
        }
    }

    private fun encrypt(input: ByteArray): ByteArray {
        val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        if (!store.containsAlias(keyAlias)) {
            val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
            generator.init(
                KeyGenParameterSpec.Builder(
                    keyAlias,
                    KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
                )
                    .setKeySize(256)
                    .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                    .setRandomizedEncryptionRequired(true)
                    .build()
            )
            generator.generateKey()
        }
        val key = store.getKey(keyAlias, null)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key)
        // Container: magic SCS1 + IV + authenticated ciphertext.
        return byteArrayOf(0x53, 0x43, 0x53, 0x31) + cipher.iv + cipher.doFinal(input)
    }
}
