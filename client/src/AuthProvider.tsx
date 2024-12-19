import { useContext, createContext, useState, ReactNode } from "react";
import { generateChallengeResponse, deriveKey } from "./utils/encryption";
import { registerUser } from "./utils/register";
import { getCookie } from "./utils/cookies";
//import { apiHost, endpoints } from "./App";
import { EndpointContext } from "./EndpointContext";

interface IAuthProps {
    children: ReactNode;
}

interface ILoginForm {
    username: string,
    password: string
}

interface AuthContext {
    user: string | null,
    session: string,
    masterKey: CryptoKey | null,
    login: (data: ILoginForm) => Promise<string>,
    regUser: (data: ILoginForm) => Promise<string>,
    logout: () => void,

}

const AuthContext = createContext<AuthContext>({} as AuthContext);

export function AuthProvider({ children }: IAuthProps) {
    const [user, setUser] = useState(null);
    const endpoints = useContext(EndpointContext);
    //const [salt, setSalt] = useState("");
    const [masterKey, SetMasterKey] = useState<CryptoKey | null>(null);
    const [session, setSession] = useState(getCookie("connect.sid"));
    //const [err, setErr] = useState<string>("");


    async function login(data: ILoginForm): Promise<string> {
        const username = data.username;
        const password = data.password;

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
                setUser(result.user);
                //setJwt(result.token);
                //localStorage.setItem("site", result.token);
                const masterKey = await deriveKey(password, salt);
                SetMasterKey(masterKey);
                console.log("success", masterKey)
                //localStorage.setItem("key", masterKey)
                return "";
            }
            throw new Error(result.error);
        } catch (err: any) {
            return err.message;
        }
    }

    async function regUser(data: ILoginForm) {
        const username = data.username;
        const password = data.password;
        const res = await registerUser(username, password);
        if (res.err != null) {
            return res.err;
        } else {
            const salt = res.salt;
            setSession(getCookie("connect.sid"));
            const masterKey = await deriveKey(password, salt);
            SetMasterKey(masterKey)
        }
    }

    async function logout() {
        setUser(null);
        setSession("");
        SetMasterKey(null);
        localStorage.removeItem("site");
    }

    return (
        <AuthContext.Provider value={{ user, session, masterKey, login, regUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
}