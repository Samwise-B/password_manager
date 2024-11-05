import { arrayBufferToBase64, deriveKeyLogin, hashDerivedKeyToBase64 } from "./encryption";
import { apiHost, apiPort, endpoints } from "../App";

export async function registerUser(username: string, masterPassword: string) {
    const salt = arrayBufferToBase64(window.crypto.getRandomValues(new Uint8Array(16)));
    const derivedKey = await deriveKeyLogin(masterPassword, salt);
    const hashedKey = await hashDerivedKeyToBase64(derivedKey);
    console.log(derivedKey, hashedKey);

    try {
        const regResponse = await fetch(`${apiHost}/${endpoints.register}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                hashedKey: hashedKey,
                salt: salt,
            }),
            credentials: 'include'
        });

        if (!regResponse.ok) {
            const error = await regResponse.json();
            throw new Error(error.error);
        }
        return { err: null, key: masterPassword, salt: salt }
    } catch (err: any) {
        return { err: err.message, key: "", salt: "" }
    }
}