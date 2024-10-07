import {useContext, createContext, useState, ReactNode} from "react";

interface IAuthProvider {
    user: string | null,
    token: string,
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
    token: "",
    login: (data: ILoginForm) => {},
    logout: () => {}
});

export function AuthProvider({ children }: IAuthProps) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("site") || "");

    async function login(data: ILoginForm) {
        try {
            const response = await fetch("localhost:3001/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data),
            });

            const res = await response.json();
            if (response.ok) {
                setUser(res.user);
                setToken(res.token);
                localStorage.setItem("site", res.token);
                return;
            }
            throw new Error(res.message);
        } catch (err) {
            console.error(err);
        }
    }

    async function logout() {
        setUser(null);
        setToken("");
        localStorage.removeItem("site");
    }

    return (
        <AuthContext.Provider value={{user, token, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
}