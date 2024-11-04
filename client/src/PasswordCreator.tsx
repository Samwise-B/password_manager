import {useForm, FormProvider} from "react-hook-form"
import { useAuth } from "./AuthProvider";
import { useAddPassword } from "./utils/addPassword";
import Offcanvas from 'react-bootstrap/Offcanvas';
import Generator from "./Generator";
import { Input } from "./PassDetails";
import { passwordCreatorProps } from "./types";

export function PasswordCreator({updatePasswordList, handleClose, handleError }: passwordCreatorProps) {
    return (
      <>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>New Password</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <NewPasswordForm handleClose={handleClose} updatePasswordList={updatePasswordList} handleError={handleError}/>
        </Offcanvas.Body>
      </>
    )   
}

export function NewPasswordForm({updatePasswordList, handleClose, handleError}: passwordCreatorProps) {
    const methods = useForm({
        criteriaMode: "all"
    });
    const {jwt, masterKey} = useAuth();

    const onSubmit = methods.handleSubmit(async data => {
        console.log(data);
        const username = data.username;
        const email = data.email;
        const password = data.password;
        const url = data.url;
        const label = data.label;
        const newPassword = await useAddPassword({username, email, password, url, label, jwt, masterKey, handleError})
        if (newPassword) {
        updatePasswordList(newPassword);
        handleClose();
        } else {
        alert("password not added");
        }
        
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.id, e.target.value);
        methods.setValue(e.target.id, e.target.value)
    }

    function validateUsernameAndEmail() {
        if (methods.getValues("email") || methods.getValues("username")) {
        return true;
        }
        return "You must enter an email or username";
    }

    return (
        <FormProvider {...methods}>
        <form onSubmit={e => e.preventDefault()} className="container" noValidate>
            <Input
                label="Username"
                type="text"
                id="username"
                value={methods.watch("username") || ""}
                maxLength={256}
                isEditing={true}
                placeholder="type your username..."
                pattern={/(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])/}
                errorMessage = "You must enter a username between 8 and 20 characters"
                customValidate={validateUsernameAndEmail}
                handleChange={handleChange}
            />
            <Input
                label="Email"
                type="email"
                id="email"
                value={methods.watch("email") || ""}
                maxLength={256}
                isEditing={true}
                placeholder="type your email..."
                pattern={/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/}
                errorMessage = "You must enter a valid email"
                customValidate={validateUsernameAndEmail}
                handleChange={handleChange}
            />
            <Generator readonlyPassword={false}/>
            <Input
                label="Website URL"
                type="url"
                id="url"
                value={methods.watch("url") || ""}
                maxLength={256}
                isEditing={true}
                placeholder="https://www.example.com"
                pattern={/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/}
                errorMessage = "You must enter a valid website URL"
                customValidate={() => true}
                handleChange={handleChange}
            />
            <Input
                label="Label (Optional)"
                type="text"
                id="label"
                value={methods.watch("label") || ""}
                maxLength={256}
                isEditing={true}
                placeholder="enter a memorable label..."
                pattern={/()/}
                errorMessage=""
                customValidate={() => true}
                handleChange={handleChange}
            />
            <div className="container">
            <button
                onClick={onSubmit}
                className="btn btn-secondary"
                data-bs-dismiss="offCanvasWindow"
            >
                Submit
            </button>
            </div>
        </form>
        </FormProvider>
    );
}