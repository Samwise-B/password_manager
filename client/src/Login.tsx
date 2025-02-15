import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { useForm } from "react-hook-form";


export function Login() {   
    const auth = useAuth();
    const [err, setErr] = useState<string>(""); 
    const methods = useForm({ criteriaMode: "all" });

    const handleLogin = methods.handleSubmit(async data => {
    //dispatch action from hooks
    if (data.username && data.password) {
        const res = await auth.login({
            username: data.username,
            password: data.password
        });
        setErr(res);
    }
    });

    const handleRegister = methods.handleSubmit(async data => {
        console.log(data);
        if (data.username && data.password) {
            const res: string = await auth.regUser({
                username: data.username,
                password: data.password
            });
            setErr(res);
        }
    })

    function handleChange() {
        setErr("");
    }

    return (
        <div className="container w-25 login-container">
            <form onSubmit={e => e.preventDefault()} className="container  text-light" noValidate>
                <div className="container mb-3"> 
                <label htmlFor="username" className="form-label">Username</label>
                <input type="text" className="form-control" id="username" 
                    {...methods.register("username", {
                        onChange: handleChange,
                    })}>
                </input>
                </div>
                <div className='container mb-3'>
                <label htmlFor="password" className="form-label">Password</label>
                <div className="container-fluid input-group px-0">
                    <input type="password" className="form-control" id="password" 
                        {...methods.register("password", {
                            onChange: handleChange,
                        })}>
                    </input>
                </div>
                </div>
                <div className="text-danger pb-3">{err}</div>
                <div className='container d-flex justify-content-center'>
                <button type="button" className="btn btn-secondary mx-1" onClick={handleLogin}>Login</button>
                <button type="button"className="btn btn-secondary mx-1" onClick={handleRegister}>Register</button>
                </div>
            </form>
        </div>  
    );
};