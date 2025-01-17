import { useContext, createContext, useState, ReactNode } from "react";
import { deriveKey } from "./utils/encryption";
import { registerUser } from "./utils/register";
import { getCookie } from "./utils/cookies";
//import { apiHost, endpoints } from "./App";
import { EndpointContext } from "./EndpointContext";
import { loginUser } from "./utils/login";

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
    const [user, setUser] = useState<string|null>(null);
    const endpoints = useContext(EndpointContext);
    //const [salt, setSalt] = useState("");
    const [masterKey, SetMasterKey] = useState<CryptoKey | null>(null);
    const [session, setSession] = useState(getCookie("connect.sid"));
    //const [err, setErr] = useState<string>("");


    async function login(data: ILoginForm): Promise<string> {
        const username = data.username;
        const password = data.password;

        const res = await loginUser(username, password, endpoints);
        if (res.err != null) {
            return res.err;
        } else {
            setUser(res.user);
            SetMasterKey(res.masterKey);
            return ""
        }
    }

    async function regUser(data: ILoginForm) {
        const username = data.username;
        const password = data.password;
        const res = await registerUser(username, password, endpoints);
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