import { useEffect } from "react";
import { PasswordListItem } from "../types";
import { deriveKey, encryptPassword, arrayBufferToBase64 } from "./encryption";



export function useAddPassword({site_favicon, username, email, password, url}: PasswordListItem) {
    useEffect(() => {
        if (username != "" && email != "" && password != "" && url != "") {
            console.log({site_favicon, username, email, password, url});
            const getKey = async () => {
                const masterKey = "secretpassword";
                const salt = arrayBufferToBase64(window.crypto.getRandomValues(new Uint8Array(16)));
                // encrypt password with master key
                const encryptedPassword = await deriveKey(masterKey, salt).then(key => {
                    //console.log("encryption key 1:", key);
                    return encryptPassword(password, key);
                });
                //console.log("encryption: ", salt, encryptedPassword);
                return {
                    salt: salt,
                    ...encryptedPassword
                }
            }
            
            getKey().then((encryptedPassword) => {
                //console.log("base64 encoding and sending")
                fetch("http://localhost:3001/addPassword", {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: username,
                        email: email,
                        url: url,
                        password: arrayBufferToBase64(encryptedPassword.ciphertext),
                        salt: encryptedPassword.salt,
                        iv: arrayBufferToBase64(encryptedPassword.iv)
                    })
                }).then(res => {
                    if (res.ok) {
                        console.log("added pass");
                    }
                }).catch(err => {
                    console.log("Failed to add password:", err);
                });
            }
            )
            
        }
    }, [site_favicon, username, email, password, url])
}

