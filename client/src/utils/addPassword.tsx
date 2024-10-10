import { useEffect } from "react";
import { PasswordListItem } from "../types";
import { deriveKey, encryptPassword, arrayBufferToBase64 } from "./encryption";

export interface IAddPassword {
    username: string;
    email: string;
    url: string;
    label: string;
    password: string;
    jwt: string;
    handleError: (errorCode: string, errorMessageShort:string, errorMessageFull:string) => void;
}
export interface IUpdatePassword {
    id: number;
    site_favicon: string;
    username: string;
    email: string;
    url: string;
    password: string;
    jwt: string;
    handleError: (errorCode: string, errorMessageShort:string, errorMessageFull:string) => void
}

export interface IDeletePassword {
    id: number;
    handleError: (errorCode: string, errorMessageShort:string, errorMessageFull:string) => void
}

export async function useAddPassword({username, email, password, url, label, jwt}: IAddPassword) {
    console.log({username, email, password, url, label});
    const masterKey = "secretpassword";
    const salt = arrayBufferToBase64(window.crypto.getRandomValues(new Uint8Array(16)));

    try {
        const encryptionKey = await deriveKey(masterKey, salt);
        const encryptedPassword = await encryptPassword(password, encryptionKey);
        const newPassword = {
            username: username,
            email: email,
            url: url,
            label: label,
            password: arrayBufferToBase64(encryptedPassword.ciphertext),
            salt: salt,
            iv: arrayBufferToBase64(encryptedPassword.iv)
        };

        const res = await fetch("http://localhost:3001/addPassword", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": jwt
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
            throw new Error(`${res.status}: Request to add password failed.`);
        }
    } catch (err) {
        throw new Error(`
            Request to add password failed.
            ${err} 
            `);
    }
}

export async function useUpdatePassword({id, site_favicon, username, email, password, url, jwt}: IUpdatePassword) {
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
                'Content-Type': 'application/json',
                "Authorization": jwt
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
        } else {
            throw new Error(`${res.status}: Request to update password failed.`);
        }
    } catch (err) {
        throw new Error(`
            Request to update password failed.
            ${err} 
            `);
    }
};

export async function useDeletePassword(id: number, jwt: string) {
    console.log("deleting:", id);
    try {
        const res = await fetch("http://localhost:3001/deletePassword", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": jwt
            },
            body: JSON.stringify({id: id})
        });

        if (res.ok) {
            console.log("deleted password");
            console.log(res);
            return id;
        } else {
            throw new Error(`${res.status}: Request to delete password failed.`);
        }
    } catch (err) {
        throw new Error(`
            Request to add password failed.
            ${err} 
            `);
    }
};
