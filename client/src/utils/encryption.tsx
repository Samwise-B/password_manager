import { EncryptedData } from "../types";


export function deriveKey(masterPassword: string, salt: string) {
    // encode pass and salt as utf-8 byte array
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(masterPassword);
    const saltBuffer = encoder.encode(salt);

    return window.crypto.subtle.importKey(
        "raw",
        passwordBuffer,
        { name: "PBKDF2"},
        false,
        ["deriveKey"]
    ).then(key => {
        return window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: saltBuffer,
                iterations: 100000,
                hash: "SHA-256"
            },
            key,
            {
                name: "AES-GCM",
                length: 256
            },
            true,
            ["encrypt", "decrypt"]
        );
    });
};

export async function deriveKeyLogin(masterPassword: string, salt: string) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(masterPassword),
        "PBKDF2",
        false,
        ["deriveKey"]
    );
    
    return await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: enc.encode(salt),
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "HMAC", hash: "SHA-256", length: 256 },
        true,
        ["sign"]
    );
}

export function encryptPassword(plaintextPassword:string, key:CryptoKey) {
    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    return window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
            tagLength: 128,
        },
        key,
        encoder.encode(plaintextPassword)
    ).then(encrypted => {
        return {
            iv: iv,
            ciphertext: new Uint8Array(encrypted)
        };
    });
};

export function decryptPassword(encryptedData: EncryptedData, key: CryptoKey) {
    return window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: encryptedData.iv,
            tagLength: 128,
        },
        key,
        encryptedData.ciphertext
    ).then(decrypted => {
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    });
}

export function hashDerivedKeyToBase64(key: CryptoKey) {
    return window.crypto.subtle.exportKey('raw', key).then(keyBytes => {
        return window.crypto.subtle.digest("SHA-256", keyBytes).then(hashBuffer => {
            // convert hash buffer to hex string
            //const hashArray = Array.from(new Uint8Array(hashBuffer));
            //const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join("");
            const hash64 = arrayBufferToBase64(new Uint8Array(hashBuffer));
            return hash64
        });
    });
}

export async function hashDerivedKeyToCryptoKey(key: CryptoKey) {
    const rawKey = await crypto.subtle.exportKey("raw", key);

    const hashedKeyBuffer = await crypto.subtle.digest("SHA-256", rawKey);

    const hashedKey = await crypto.subtle.importKey(
        "raw",
        hashedKeyBuffer,
        { name:"HMAC", hash:"SHA-256" },
        true,
        ["sign"]
    )
    return hashedKey;
}

export function arrayBufferToBase64(buffer: Uint8Array) {
    // Create a Uint8Array from the buffer
    const bytes = new Uint8Array(buffer);
    // Convert to binary string
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    // Convert binary string to Base64
    return window.btoa(binary); // Use btoa to encode to Base64
}

export function base64ToUint8Array(base64: string) {
    console.log("based", base64);
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
 

export async function generateChallengeResponse(password: string, challenge: string, salt:string) {
    const key = await deriveKeyLogin(password, salt);
    const hashedKey = await hashDerivedKeyToCryptoKey(key);

    // Compute the HMAC using the derived key and challenge
    const enc = new TextEncoder();
    const signature = await crypto.subtle.sign(
        "HMAC",
        hashedKey,
        enc.encode(challenge)
    );

    return arrayBufferToBase64(new Uint8Array(signature));
}

