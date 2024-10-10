import {useContext, createContext, useState, ReactNode} from "react";
import { generateChallengeResponse } from "./utils/encryption";
import { registerUser } from "./utils/register";

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
    login: async (data: ILoginForm) => {return ""},
    regUser: async (data: ILoginForm) => {return ""},
    logout: async () => {}
});

export function AuthProvider({ children }: IAuthProps) {
    const [user, setUser] = useState(null);
    const [jwt, setJwt] = useState(localStorage.getItem("site") || "");
    //const [err, setErr] = useState<string>("");


    async function login(data: ILoginForm): Promise<string> {
        const username = data.username;
        const password = data.password;

        try {
            const challengeResponse = await fetch("http://localhost:3001/login-challenge", {
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

            const verifyResponse = await fetch("http://localhost:3001/verify-challenge", {
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
                setJwt(result.token);
                localStorage.setItem("site", result.token);
                return "";
            }
            throw new Error(result.error);
        } catch (err: any) {
            return err.message;
        }
        // return fetch("http://localhost:3001/login-challenge", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({ username }),
        // }).then(challengeResponse => {
        //     // Check if response is OK
        //     // if (!challengeResponse.ok) {
        //     //     return Promise.reject(challengeResponse.json());
        //     // }
        //     return challengeResponse.json();
        // }).then(challengeObj => {
        //     if (!challengeObj.success) {
        //         throw new Error(challengeObj);
        //     }
        //     return challengeObj;
        // })
        // .then(({challenge, salt}) => {
        //     //const { challenge, salt } = challengeResponse.json();
        //     return generateChallengeResponse(password, challenge, salt).then(response => ({
        //         response,
        //         challenge,
        //     }));
        // }).then(({response, challenge}) => {
        //     return fetch("http://localhost:3001/verify-challenge", {
        //         method: "POST",
        //         headers: {
        //             'Content-Type': "application/json",
        //         },
        //         body: JSON.stringify({ username, response, challenge })
        //     });
        // })
        // .then(verifyResponse => {
        //     if (!verifyResponse.ok) {
        //         return Promise.reject(verifyResponse.json());
        //     }
        //     return verifyResponse.json();
        // })
        // .then(result => {
        //     if (result.success) {
        //         console.log("Successful Authentication!", result.user, result.token);
        //         setUser(result.user);
        //         setJwt(result.token);
        //         localStorage.setItem("site", result.token);
        //         return {success: true, error: ""};
        //     }
        //     return(result);
        // })
        // .catch(err => {
        //     console.error("Error:", err.message);
        //     setErr(err.message);
        //     return {success: false, error: err.message};
        //     //return err.message;
        // });
    }

    async function regUser(data: ILoginForm) {
        const username = data.username;
        const password = data.password;
        return registerUser(username, password);
    }

    async function logout() {
        setUser(null);
        setJwt("");
        localStorage.removeItem("site");
    }

    return (
        <AuthContext.Provider value={{user, jwt, login, regUser, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
}