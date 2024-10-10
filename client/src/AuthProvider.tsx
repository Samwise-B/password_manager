import {useContext, createContext, useState, ReactNode} from "react";
import { generateChallengeResponse } from "./utils/encryption";

interface IAuthProvider {
    user: string | null,
    jwt: string,
    err: string | null,
    login: () => void,
    logout: () => void
}

interface IAuthProps {
    children: ReactNode;
}

interface ILoginForm {
    username: string,
    password: string
}

const AuthContext = createContext({
    user: null,
    jwt: "",
    err: "",
    login: (data: ILoginForm) => {},
    logout: () => {}
});

export function AuthProvider({ children }: IAuthProps) {
    const [user, setUser] = useState(null);
    const [jwt, setJwt] = useState(localStorage.getItem("site") || "");
    const [err, setErr] = useState<string>("");


    async function login(data: ILoginForm) {
        const username = data.username;
        const password = data.password;

        return fetch("http://localhost:3001/login-challenge", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username }),
        }).then(challengeResponse => {
            // Check if response is OK
            if (!challengeResponse.ok) {
                return challengeResponse.json().then(err => {
                    if (challengeResponse.status == 404) {
                        return Promise.reject(new Error("Incorrect username or password"));
                    } else {
                        return Promise.reject(new Error(err.message));
                    }
                });
            }
            return challengeResponse.json();
        })
        .then(({challenge, salt}) => {
            //const { challenge, salt } = challengeResponse.json();
            return generateChallengeResponse(password, challenge, salt).then(response => ({
                response,
                challenge,
            }));
        }).then(({response, challenge}) => {
            return fetch("http://localhost:3001/verify-challenge", {
                method: "POST",
                headers: {
                    'Content-Type': "application/json",
                },
                body: JSON.stringify({ username, response, challenge })
            });
        })
        .then(verifyResponse => {
            if (!verifyResponse.ok) {
                return verifyResponse.json().then(err => {
                    return Promise.reject(err.message || "Challenge verification failed.");
                });
            }
            return verifyResponse.json();
        })
        .then(result => {
            if (result.success) {
                console.log("Successful Authentication!", result.user, result.token);
                setUser(result.user);
                setJwt(result.token);
                localStorage.setItem("site", result.token);
                return {success: true};
            }
            throw new Error(result.message);
        })
        .catch(err => {
            console.error("Error:", err.message);
            setErr(err.message);
            //return err.message;
        });
    }

    async function logout() {
        setUser(null);
        setJwt("");
        localStorage.removeItem("site");
    }

    return (
        <AuthContext.Provider value={{user, err, jwt, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
}