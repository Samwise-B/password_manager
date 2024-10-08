import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { FormEventHandler } from "react";
import { useForm } from "react-hook-form"
import { ErrorMessage } from "@hookform/error-message";
import { registerUser } from "./utils/encryption";


export function Login() {
    const auth = useAuth();
    const methods = useForm({ criteriaMode: "all" });

    const handleLogin = methods.handleSubmit(async data => {
    if (data.username !== "" && data.password !== "") {
        //dispatch action from hooks
        auth.login({
            username: data.username,
            password: data.password
        });
        return;
    }
    console.log("please provide a valid input");
    });

    const handleRegister = methods.handleSubmit(async data => {
        console.log(data);
        registerUser(data.username, data.password);
    })

    return (
        <div className="container">
            <form onSubmit={e => e.preventDefault()} className="container  text-light" noValidate>
                <div className="container mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input type="text" className="form-control" id="username" 
                {...methods.register("username", {
                    required: {
                    value: true,
                    message: "A username is required"
                    },
                    pattern: {
                    value: /(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])/,
                    message: "You must enter a username between 8 and 20 characters"
                    }
                })}></input>
                <ErrorMessage
                    errors={methods.formState.errors}
                    name={"username"}
                    render={({ messages }) => 
                    messages &&
                    Object.entries(messages).map(([type, message]) => (
                        <p key={type} className='text-danger'>{message}</p>
                    ))
                    }
                />
                </div>
                <div className='container mb-3'>
                <label htmlFor="password" className="form-label">Password</label>
                <div className="container-fluid input-group mb-3 px-0">
                    <input type="text" className="form-control" id="password" 
                    {...methods.register("password", {
                    required: {
                        value: true,
                        message: "A password is required"
                    },
                    })}></input>
                    <ErrorMessage
                    errors={methods.formState.errors}
                    name={"password"}
                    render={({ messages }) => 
                        messages &&
                        Object.entries(messages).map(([type, message]) => (
                        <p key={type} className='text-danger'>{message}</p>
                        ))
                    }
                    />
                </div>
                </div>
                <div className='container d-flex justify-content-center'>
                <button type="button" className="btn btn-primary mx-1" onClick={handleLogin}>Login</button>
                <button type="button"className="btn btn-primary mx-1" onClick={handleRegister}>Register</button>
                </div>
            </form>
        </div>
        
    );
};