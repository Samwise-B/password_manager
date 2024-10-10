import {passDetailProps, IEditButtonProps, PasswordListItem} from './types';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useState } from 'react';
import { useForm, useFormContext, FormProvider } from "react-hook-form"
import { ErrorMessage } from "@hookform/error-message";
import { useDeletePassword, useUpdatePassword } from './utils/addPassword';
import { ErrorBoundary } from "react-error-boundary";
import { ErrorPage } from './ErrorPage';
import { useAuth } from './AuthProvider';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export function PassDetails({passList, currentIndex, updatePassList, handleClose, handleError} : passDetailProps) {
    const [passInputType, setPassInputType] = useState<string>("password");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [passItem, setPassItem] = useState<PasswordListItem>(passList[currentIndex]);
    const [staticPassItem, setStaticPassItem] = useState<PasswordListItem>(passList[currentIndex]);
    const [showPassword, setShowPassword] = useState<string>("Show");
    const [hasChanged, setHasChanged] = useState<boolean>(false);
    const user = useAuth();
    const methods = useForm({ 
      defaultValues: {
        ...passItem
      },
      criteriaMode: "all" 
    });

    //const passItem = passList[currentIndex];
    //console.log(passItem);
  
    function toggleShowPassword() {
      if (passInputType == "password") {
        setPassInputType("text");
        setShowPassword("Hide");
      } else {
        setPassInputType("password");
        setShowPassword("Show");
      }
    }
  
    function toggleEditPassword() {
      setIsEditing(!isEditing);
      if (!isEditing && passInputType != "text") {
        toggleShowPassword();
      }
      if (isEditing && passInputType != "password") {
        toggleShowPassword();
      }
      setPassItem(staticPassItem);
    }
  
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      if (!hasChanged) {
        setHasChanged(true);
      } 
      const {id, value} = e.target;
      setPassItem((prevItem) => ({
        ...prevItem,
        [id]:value
      }));
    }

    const updatePassword = methods.handleSubmit(async data => {
      console.log("form data:", data);
      if (hasChanged) {
        const updatedPassword = await useUpdatePassword({
          id: passItem.id,
          site_favicon: "/vite.svg",
          username: data.username,
          email: data.email,
          password: data.password,
          url: data.url,
          label: data.label,
          jwt: user.jwt,
          handleError: handleError
        });
        if (updatedPassword) {
          updatePassList(updatedPassword, "update");
          setStaticPassItem(updatedPassword);
        } else {
          throw new Error(`Error: Password item not found.`);
        }
      }
      setIsEditing(false);
    })

    function validateUsernameAndEmail() {
      if (methods.getValues("email") || methods.getValues("username")) {
        return true;
      }
      return "You must enter an email or username";
    }
  
    return (
      <>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className='container d-flex justify-content-center'>Password Details</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ErrorBoundary 
            fallback={
              <ErrorPage errorCode="Error" 
                errorMessageShort="Failed to Update Password"
                errorMessageFull='Something went wrong when updating the password.'/>
            }>
            <FormProvider {...methods}>
            <form onSubmit={e => e.preventDefault()} className="container" noValidate>
              <input type="hidden" name="id" value={passItem.id}></input>
              <Input 
                value={passItem.email}
                placeholder='' 
                label={"Email address"} 
                type={"email"} 
                id={"email"} 
                pattern={/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/} 
                isEditing={isEditing} 
                errorMessage={"You must enter a valid email (e.g. example@email.com)."} 
                maxLength={256}
                customValidate={validateUsernameAndEmail} 
                handleChange={handleChange}
              />
              <Input
                value={passItem.username}
                placeholder=''  
                label={"Username"} 
                type={"text"} 
                id={"username"} 
                pattern={/(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])/} 
                isEditing={isEditing} 
                errorMessage={"You must enter a username between 8 and 20 characters"} 
                customValidate={validateUsernameAndEmail} 
                maxLength={256}
                handleChange={handleChange}
              />
              <EditPassInput
                value={passItem.password}  
                label={"Password"} 
                type={passInputType} 
                id={"password"} 
                pattern={/()/} 
                maxLength={48}
                isEditing={isEditing}
                showPassword={showPassword} 
                errorMessage={"Password must be no more than 48 characters."} 
                customValidate={() => methods.getValues("password") != ""} 
                handleChange={handleChange}
                toggleShowPassword={toggleShowPassword}
              />
              <Input
                value={passItem.url}
                placeholder=''  
                label={"Website URL"} 
                type={"text"} 
                id={"url"} 
                pattern={/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/} 
                maxLength={48}
                isEditing={isEditing} 
                errorMessage={"You must enter a valid web address (e.g. https://www.google.com)"} 
                customValidate={() => true}
                handleChange={handleChange}
              />
              <Input
                label="Label (Optional)"
                type="text"
                id="label"
                value={methods.watch("label") || ""}
                maxLength={256}
                isEditing={isEditing}
                placeholder="enter a memorable label..."
                pattern={/()/}
                errorMessage=""
                customValidate={() => true}
                handleChange={handleChange}
              />
              <div className='container d-flex justify-content-center'>
                <EditButton isEditing={isEditing} toggleEditPassword={toggleEditPassword} updatePassword={updatePassword}/>
                <DeleteButton passItem={passItem} updatePassList={updatePassList} closeOffCanvas={handleClose}/>
              </div>
            </form>
          </FormProvider>
        </ErrorBoundary>
      </Offcanvas.Body>
    </>
    )
}

interface IInputProps {
  value: string,
  placeholder:string,
  label: string,
  type: string,
  id: string,
  pattern: RegExp,
  isEditing: boolean,
  errorMessage: string,
  maxLength: number,
  customValidate: () => boolean | string,
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
}

interface EditPassInputProps {
  value: string,
  label: string,
  type: string,
  id: string,
  pattern: RegExp,
  isEditing: boolean,
  errorMessage: string,
  maxLength: number,
  showPassword:string,
  customValidate: () => boolean | string,
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  toggleShowPassword: () => void,
}

function EditPassInput({ value, label, type, id, pattern, isEditing, errorMessage, maxLength, showPassword, customValidate, handleChange, toggleShowPassword }: EditPassInputProps) {
  const { register, formState: {errors} } = useFormContext();

  return (
    <div className="container mb-3">
      <div className='container'>
        <label htmlFor={id} className="form-label">{label}</label>
      </div>
      <div className="container-fluid input-group mb-3 px-0">
        <input type={type} className="form-control" 
          id={id}  
          value={value}
          readOnly={!isEditing}
          disabled={!isEditing}
          {...register(id, {
            onChange: handleChange,
            validate: () => customValidate(),
            pattern: {
              value: pattern,
              message: errorMessage
            },
            maxLength: {
              value: maxLength,
              message: `${label} must be no more than ${maxLength} characters.`
            }
            })}
        />
        <button type="button" className="btn btn-outline-secondary" onClick={toggleShowPassword}>{showPassword}</button>
      </div>
      <ErrorMessage
        errors={errors}
        name={id}
        render={({ messages }) => 
          messages &&
          Object.entries(messages).map(([type, message]) => (
            <p key={type} className='text-danger'>{message}</p>
          ))
        }
      />
    </div>
  );
}

export function Input({ value, placeholder, label, type, id, pattern, isEditing, errorMessage, maxLength, customValidate, handleChange }: IInputProps) {
  const { register, formState: {errors} } = useFormContext();

  return (
    <div className="container mb-3">
      <div className='container'>
        <label htmlFor={id} className="form-label">{label}</label>
      </div>
      <input type={type} className="form-control" 
        id={id}  
        value={value}
        readOnly={!isEditing}
        disabled={!isEditing}
        placeholder={placeholder}
        {...register(id, {
          onChange: handleChange,
          validate: () => customValidate(),
          pattern: {
            value: pattern,
            message: errorMessage
          },
          maxLength: {
            value: maxLength,
            message: `${label} must be no more than ${maxLength} characters.`
          }
          })}
      />
      <ErrorMessage
        errors={errors}
        name={id}
        render={({ messages }) => 
          messages &&
          Object.entries(messages).map(([type, message]) => (
            <p key={type} className='text-danger'>{message}</p>
          ))
        }
      />
    </div>
  );
}

interface IDeletePassword {
  passItem: PasswordListItem, 
  updatePassList: (passItem: PasswordListItem, operation: string) => void,
  closeOffCanvas: () => void
}

export function DeleteButton({passItem, updatePassList, closeOffCanvas}: IDeletePassword) {
  const [show, setShow] = useState<boolean>(false);
  const user = useAuth();

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  async function deletePassword() {
    const deletedPassword = await useDeletePassword(passItem.id, user.jwt);

    if (deletedPassword) {
      updatePassList({...passItem}, "delete");
      handleClose();
      closeOffCanvas();
    } else {
      console.log("error deleting password");
    }
  }


  return (
    <>
      <Button onClick={handleShow} variant='secondary'>Delete</Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Permanently Delete Password?</Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button variant="danger" onClick={deletePassword}>Delete</Button>
          <Button variant="dark" onClick={handleClose}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    </>
    
  )
}

export function EditButton({isEditing, toggleEditPassword, updatePassword}: IEditButtonProps) {
    if (!isEditing) {
        return <button type="button" className="btn btn-secondary mx-1" onClick={toggleEditPassword}>Edit</button>;
    } else {
        return (
          <>
            <button type="button" className="btn btn-success mx-1" onClick={updatePassword}>Update</button>
            <button type="button" className='btn btn-danger mx-1' onClick={toggleEditPassword}>Cancel</button>
          </>
        );
    }
}