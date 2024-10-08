import {useContext, createContext, useState, ReactNode} from "react";
import { generateChallengeResponse } from "./utils/encryption";

interface IAuthProvider {
    user: string | null,
    jwt: string,
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
    login: (data: ILoginForm) => {},
    logout: () => {}
});

export function AuthProvider({ children }: IAuthProps) {
    const [user, setUser] = useState(null);
    const [jwt, setJwt] = useState(localStorage.getItem("site") || "");

    async function login(data: ILoginForm) {
        try {
            const username = data.username;
            const password = data.password;
            const challengeResponse = await fetch("http://localhost:3001/login-challenge", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username }),
            });

            const { challenge, salt } = await challengeResponse.json();
            
            const response = await generateChallengeResponse(password, challenge, salt);

            const verifyResponse = await fetch("http://localhost:3001/verify-challenge", {
                method: "POST",
                headers: {
                    'Content-Type': "application/json",
                },
                body: JSON.stringify({ username, response, challenge })
            });

            const result = await verifyResponse.json();

            if (result.success) {
                console.log("Successful Authentication!", result.user, result.token);
                setUser(result.user);
                setJwt(result.token);
                localStorage.setItem("site", result.token)
                return;
            }
            throw new Error(result.message);
        } catch (err) {
            console.error(err);
        }
    }

    async function logout() {
        setUser(null);
        setJwt("");
        localStorage.removeItem("site");
    }

    return (
        <AuthContext.Provider value={{user, jwt, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
}