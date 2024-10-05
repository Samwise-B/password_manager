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

// export async function useUpdatePassword({id, site_favicon, username, email, password, url}: PasswordListItem) {
//     console.log({site_favicon, username, email, password, url});
//     const masterKey = "secretpassword";
//     const salt = arrayBufferToBase64(window.crypto.getRandomValues(new Uint8Array(16)));
//     const encryptionKey = await deriveKey(masterKey, salt);
//     const encryptedPassword = await encryptPassword(password, encryptionKey);
//     const updatedPassword = {
//         id: id,
//         username: username,
//         email: email,
//         url: url,
//         password: arrayBufferToBase64(encryptedPassword.ciphertext),
//         salt: salt,
//         iv: arrayBufferToBase64(encryptedPassword.iv)
//     };

//     const res = await fetch("http://localhost:3001/updatePassword", {
//         method: "POST",
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(updatedPassword)
//     });

//     if (res.ok) {
//         const newPassList = passList.map((passItem) => {
//             if (passItem.id == updatedPassword.id) {
//                 passItem = updatedPassword;
//             }
//         })
//         setPasswordList(...newPassList);
//     }
//     const getKey = async () => {
        
//         // encrypt password with master key
//         const encryptedPassword = await deriveKey(masterKey, salt).then(key => {
//             //console.log("encryption key 1:", key);
//             return encryptPassword(password, key);
//         });
//         //console.log("encryption: ", salt, encryptedPassword);
//         return {
//             salt: salt,
//             ...encryptedPassword
//         }
//     }
    
//     getKey().then((encryptedPassword) => {
//         //console.log("base64 encoding and sending")
//         const res = await fetch("http://localhost:3001/updatePassword", {
//             method: "POST",
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 id: id,
//                 username: username,
//                 email: email,
//                 url: url,
//                 password: arrayBufferToBase64(encryptedPassword.ciphertext),
//                 salt: encryptedPassword.salt,
//                 iv: arrayBufferToBase64(encryptedPassword.iv)
//             })
//         return {
        
//         }
//         }).then((res, passItem) => {
//             if (res.ok) {
//                 console.log("added pass");
//             }
//         }).catch(err => {
//             console.log("Failed to add password:", err);
//         });
//     }
//     )
// }
