import { IEndpointContext } from "../EndpointContext";
import { deriveKey, generateChallengeResponse } from "./encryption";

interface ILoginUser {
    user: string | null,
    masterKey: CryptoKey| null,
    err: string | null
}

export async function loginUser(username: string, password: string, endpoints: IEndpointContext): Promise<ILoginUser> {
        try {
            const challengeResponse = await fetch(`${endpoints.apiHost}/${endpoints.loginChallenge}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username }),
            });

            if (!challengeResponse.ok) {
                const error = await challengeResponse.json();
                throw new Error(error.error);
            }

            const { challenge, salt } = await challengeResponse.json();

            const challengeString = await generateChallengeResponse(password, challenge, salt);
            console.log(username, challengeString, challenge);

            const verifyResponse = await fetch(`${endpoints.apiHost}/${endpoints.verifyChallenge}`, {
                method: "POST",
                headers: {
                    'Content-Type': "application/json",
                },
                body: JSON.stringify({ username, response: challengeString })
            });

            if (!verifyResponse.ok) {
                const error = await verifyResponse.json();
                throw new Error(error.error);
            }

            const result = await verifyResponse.json();

            if (result.success) {
                //console.log("Successful Authentication!", result.user, result.token);
                //setUser(result.user);
                //setJwt(result.token);
                //localStorage.setItem("site", result.token);
                const masterKey = await deriveKey(password, salt);
                //SetMasterKey(masterKey);
                console.log("success", masterKey)
                //localStorage.setItem("key", masterKey)
                return {user: result.user, masterKey: masterKey, err: null};
            }
            return {err: result.error, masterKey: null, user: null};
        } catch (err: any) {
            return {err: err.message, masterKey: null, user: null};
        }
    }