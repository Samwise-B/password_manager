import { useEffect } from "react";
import { PasswordListItem } from "../types";
import { deriveKey, encryptPassword, arrayBufferToBase64 } from "./encryption";

export interface IAddPassword {
    site_favicon: string;
    username: string;
    email: string;
    url: string;
    password: string;
}
export interface IUpdatePassword {
    id: number;
    site_favicon: string;
    username: string;
    email: string;
    url: string;
    password: string;
}

export interface IDeletePassword {
    id: number;
}

export async function useAddPassword({site_favicon, username, email, password, url}: IAddPassword) {
    console.log({site_favicon, username, email, password, url});
    const masterKey = "secretpassword";
    const salt = arrayBufferToBase64(window.crypto.getRandomValues(new Uint8Array(16)));

    try {
        const encryptionKey = await deriveKey(masterKey, salt);
        const encryptedPassword = await encryptPassword(password, encryptionKey);
        const newPassword = {
            username: username,
            email: email,
            url: url,
            password: arrayBufferToBase64(encryptedPassword.ciphertext),
            salt: salt,
            iv: arrayBufferToBase64(encryptedPassword.iv)
        };

        const res = await fetch("http://localhost:3001/addPassword", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newPassword)
        });

        if (res.ok) {
            console.log("added password");
            const result = await res.json();
            result['password'] = password;
            delete result.encrypted_password;
            console.log(result);
            return result
        }
        else {
            console.log("failed to add password")
            return false;
        }
    } catch (err) {
        console.log("error:", err)
    }
}

export async function useUpdatePassword({id, site_favicon, username, email, password, url}: IUpdatePassword) {
    console.log({site_favicon, username, email, password, url});
    const masterKey = "secretpassword";
    // generate new encryption key & encrypt password
    const salt = arrayBufferToBase64(window.crypto.getRandomValues(new Uint8Array(16)));
    try {
        const encryptionKey = await deriveKey(masterKey, salt);
        const encryptedPassword = await encryptPassword(password, encryptionKey);
        const updatedPassword = {
            id: id,
            username: username,
            email: email,
            url: url,
            password: arrayBufferToBase64(encryptedPassword.ciphertext),
            salt: salt,
            iv: arrayBufferToBase64(encryptedPassword.iv)
        };

        const res = await fetch("http://localhost:3001/updatePassword", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedPassword)
        });

        if (res.ok) {
            console.log("updated password");
            const result = await res.json();

            result['password'] = password;
            delete result.encrypted_password;
            console.log(result);

            return result;
        }
    } catch (err) {
        console.log("error updating password:", err);
    }
};

export async function useDeletePassword(id: number) {
    console.log("deleting:", id);
    try {
        const res = await fetch("http://localhost:3001/deletePassword", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id: id})
        });

        if (res.ok) {
            console.log("deleted password");
            console.log(res);
            return id;
        }
    } catch (err) {
        console.log("error updating password:", err);
    }
};
