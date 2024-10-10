import { arrayBufferToBase64, deriveKeyLogin, hashDerivedKeyToBase64 } from "./encryption";
import { useAuth } from "../AuthProvider";

export async function registerUser(username: string, masterPassword: string) {
    const salt = arrayBufferToBase64(window.crypto.getRandomValues(new Uint8Array(16)));
    const derivedKey = await deriveKeyLogin(masterPassword, salt);
    const hashedKey = await hashDerivedKeyToBase64(derivedKey);
    console.log(derivedKey, hashedKey);

    try {
        const regResponse = await fetch("http://localhost:3001/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                username: username,
                hashedKey: hashedKey,
                salt: salt,
            }),
        });

        if (!regResponse.ok) {
            const error = await regResponse.json();
            throw new Error(error.error);
        }
    } catch (err: any) {
        return err.message
    }

    // return fetch("http://localhost:3001/register", {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ 
    //         username: username,
    //         hashedKey: hashedKey,
    //         salt: salt,
    //     }),
    // }).then(async registerRes => {
    //     if (registerRes.ok) {
    //         const err = await registerRes.json();
    //         throw new Error(err.error);
    //     }
    //     return {success: true, error: ""}
    // }).catch(errMsg => {
    //     return errMsg.error
    // });
}