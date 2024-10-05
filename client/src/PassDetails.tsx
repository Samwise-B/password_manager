import {passDetailProps, IEditButtonProps, PasswordListItem} from './types';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useState } from 'react';
import {useForm, FormProvider} from "react-hook-form"
import { ErrorMessage } from "@hookform/error-message";
import { Input } from './App';
//import { useUpdatePassword } from './utils/addPassword';

export function PassDetails({passList, currentIndex} : passDetailProps) {
    const [passInputType, setPassInputType] = useState<string>("password");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [passItem, setPassItem] = useState<PasswordListItem>(passList[currentIndex]);
    const methods = useForm({ criteriaMode: "all" });
    //const passItem = passList[currentIndex];
    //console.log(passItem);
  
    function handleShowPassword() {
      if (passInputType == "password") {
        setPassInputType("text");
      } else {
        setPassInputType("password");
      }
    }
  
    function handleEditPassword() {
      setIsEditing(true);
      handleShowPassword();
    }
  
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const {id, value} = e.target;
      setPassItem((prevItem) => ({
        ...prevItem,
        [id]:value
      }));
      console.log(passItem)
    }

    const updatePassword = methods.handleSubmit(async data => {
      console.log(data);
      // await useUpdatePassword({
      //   id: data.id,
      //   site_favicon: "/vite.svg",
      //   username: data.username,
      //   email: data.email,
      //   password: data.password,
      //   encrypted_password: "",
      //   url: data.url,
      //   iv: "",
      //   salt: "",
      // });
      setIsEditing(false);
    })
  
    return (
      <>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className='container d-flex justify-content-center'>Password Details</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* <div className="container">
            <div className="container mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input type="email" className="form-control" id="email" 
                value={passItem.email} 
                readOnly={!isEditing} 
                onChange={handleChange}></input>
            </div>
            <div className="container mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input type="text" className="form-control" id="username" 
              value={passItem.username} 
              readOnly={!isEditing} 
              onChange={handleChange}></input>
            </div>
            <label htmlFor="password" className="form-label">Password</label>
            <div className="container input-group mb-3">
              <input type={passInputType} id="password" className="form-control" aria-describedby="passwordHelpBlock" 
              value={passItem.password}  
              readOnly={!isEditing}
              onChange={handleChange}></input>
              <button type="button" className="btn btn-primary" onClick={handleShowPassword}>Show</button>
            </div>
            <div className="container mb-3">
              <label htmlFor="url" className="form-label">Website</label>
              <input type="url" className="form-control" id="url" 
              value={passItem.url} 
              readOnly={!isEditing}
              onChange={handleChange}></input>
            </div>
          </div> */}
          <form onSubmit={e => e.preventDefault()} className="container" noValidate>
            <input type="hidden" name="id" value={passItem.id}></input>
            <div className="container mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input type="email" className="form-control" id="email" 
                value={passItem.email} 
                readOnly={!isEditing}
                {...methods.register("email", {
                  onChange: handleChange,
                  required: {
                    value: true,
                    message: "An email is required"
                  },
                  pattern: {
                    value: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
                    message: "You must enter a valid email (e.g. example@email.com)."
                  }
                })}></input>
                <ErrorMessage
                  errors={methods.formState.errors}
                  name={"email"}
                  render={({ messages }) => 
                    messages &&
                    Object.entries(messages).map(([type, message]) => (
                      <p key={type} className='text-danger'>{message}</p>
                    ))
                  }
                />
            </div>
            <div className="container mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input type="text" className="form-control" id="username" 
              value={passItem.username} 
              readOnly={!isEditing} 
              {...methods.register("username", {
                onChange: handleChange,
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
                <input type={passInputType} className="form-control" id="password" 
                value={passItem.password} 
                readOnly={!isEditing} 
                {...methods.register("password", {
                  onChange: handleChange,
                  required: {
                    value: true,
                    message: "A password is required"
                  },
                  maxLength: {
                    value: 48,
                    message: "Password must be no more than 48 characters."
                  }
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
                <button type="button" className="btn btn-primary" onClick={handleShowPassword}>Show</button>
              </div>
            </div>
            
            <div className="container mb-3">
              <label htmlFor="url" className="form-label">Website URL</label>
              <input type="text" className="form-control" id="url" 
              value={passItem.url} 
              readOnly={!isEditing} 
              {...methods.register("url", {
                onChange: handleChange,
                required: {
                  value: true,
                  message: "A website URL is required"
                },
                pattern: {
                  value: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                  message: "You must enter a valid web address (e.g. https://www.google.com)"
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
            <div className='container d-flex justify-content-center'>
              <EditButton isEditing={isEditing} handleEditPassword={handleEditPassword} updatePassword={updatePassword}/>
              <button type="button" className="btn btn-primary mx-3">Delete</button>
            </div>
          </form>
        </Offcanvas.Body>
      </>
    )
}

export function EditButton({isEditing, handleEditPassword, updatePassword}: IEditButtonProps) {
    if (!isEditing) {
        return <button type="button" className="btn btn-primary mx-3" onClick={handleEditPassword}>Edit</button>;
    } else {
        return <button type="button" className="btn btn-primary mx-3" onClick={updatePassword}>Done</button>;
    }
}