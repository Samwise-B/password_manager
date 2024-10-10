import { HTMLInputTypeAttribute, useEffect, useState, createContext, useContext, Children } from 'react';
import './css/App.css';
import './scss/styles.scss';
import Generator from './Generator';
import { PassDetails, EditButton } from './PassDetails';
import { deriveKey, encryptPassword, decryptPassword, base64ToUint8Array } from './utils/encryption';
import {useForm, FormProvider, useFormContext } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useAddPassword } from './utils/addPassword';
import { PasswordItem, PasswordListItem } from './types';
import { AuthProvider, useAuth } from "./AuthProvider";
import { Login } from './Login';
import { ErrorPage } from './ErrorPage';
import { Input } from './PassDetails';
import { PassBank, PassBankItem } from './PassBank';
import 'bootstrap-icons/font/bootstrap-icons.css';
import classNames from "classnames";


interface navigationProps {
  onGeneratorClick: () => void,
  onBankClick: () => void,
  onNewPasswordClick: () => void
}

interface IInputProps {
  label: string,
  type: HTMLInputTypeAttribute, 
  id: string, 
  placeholder: string,
  pattern: RegExp,
  errorMessage: string
}

interface IFromInputs {
  username: string,
  email: string,
  url: string,

}

interface IErrorProps {
  errorMessage: string
}

interface passwordCreatorProps {
  updatePasswordList: ({site_favicon, username, email, password, url}: PasswordListItem) => void,
  handleClose: () => void,
  handleError: (errorCode: string, errorMessageShort:string, errorMessageFull:string) => void,
}

interface OffCanvasProps {
  //renderCanvasContent: () => React.ReactNode;
  show: boolean;
  setShow: (val: boolean) => void;
  canvasContent: string; 
  passList: Array<PasswordListItem>; 
  currentIndex: number; 
  UpdatePassList: ({id, site_favicon, username, email, password, url, salt, iv}: PasswordListItem, operation: string) => void; 
  AddToPassList: ({id, site_favicon, username, email, password, url, salt, iv}: PasswordListItem) => void;
  handleError: (errorCode: string, errorMessageShort:string, errorMessageFull:string) => void;
}

interface ISearchBarProps {
  filterPL: (substring: string) => void;
}

function Navigation({onGeneratorClick, onBankClick, onNewPasswordClick}: navigationProps) {
  const [isBankActive, setIsBankActive] = useState<boolean>(true);
  const [isGenActive, setIsGenActive] = useState<boolean>(false);

  function handleBankClick() {
    setIsGenActive(false);
    setIsBankActive(true);
    onBankClick();
  }

  function handleGenClick() {
    setIsBankActive(false);
    setIsGenActive(true);
    onGeneratorClick();
  }

  const bankBtnClass = classNames({
    "nav-link": true,
    "active": isBankActive
  });

  const genBtnClass = classNames({
    "nav-link": true,
    "active": isGenActive
  })

  return (
    <header className="px-3 py-1 bg-secondary text-white">
      <div className='container-fluid'>
        <div className='d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start'>
          <ul className="nav nav-underline d-flex align-items-center me-lg-auto">
            <li className="nav-item list-group-item">
              <button type="button" className={bankBtnClass} aria-current={isBankActive} onClick={handleBankClick}>
                <i className="bi bi-shield-lock mx-2"></i>Bank
              </button>
            </li>
            <li className="nav-item">
              <button type="button" className={genBtnClass} aria-current={isGenActive} onClick={handleGenClick}>
                <i className="bi bi-chat-left-text mx-2"></i>Generator
              </button>
            </li>
          </ul>
          <button type="button" className="btn btn-secondary mx-2 align-items-center" onClick={onNewPasswordClick} data-bs-toggle="offcanvas" data-bs-target="#offCanvasWindow"><i className="bi bi-plus"></i></button>
        </div>
      </div>
      
    </header>
  )
}

function Search({filterPL}: ISearchBarProps) {

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const searchString = e.target.value.toLowerCase();
    filterPL(searchString);
  }

  return (
    <>
      <div className='container-fluid input-group py-3 border-bottom border-secondary'>
        <input className="form-control border-secondary" type="text" id="generatedPassword" placeholder='Search' onChange={handleChange}></input>    
      </div>
    </>
  )
}

function NewPasswordForm({updatePasswordList, handleClose, handleError}: passwordCreatorProps) {
  const methods = useForm({
    criteriaMode: "all"
  });
  const {jwt} = useAuth();

  const onSubmit = methods.handleSubmit(async data => {
    console.log(data);
    const site_favicon = "/vite.svg"
    const username = data.username;
    const email = data.email;
    const password = data.password;
    const url = data.url
    const newPassword = await useAddPassword({site_favicon, username, email, password, url, jwt, handleError})
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
          placeholder="example@email.com"
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
          placeholder="https://www.placeholder.com"
          pattern={/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/}
          errorMessage = "You must enter a valid website URL"
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

function PasswordCreator({updatePasswordList, handleClose, handleError }: passwordCreatorProps) {
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

function OffCanvasWindow({canvasContent, passList, currentIndex, UpdatePassList, AddToPassList, show, setShow, handleError} : OffCanvasProps) {

  const handleClose = () => {
    console.log("handle close");
    setShow(false);
  }


  function renderCanvasContent() {
    if (canvasContent == "details") {
      return (
        <PassDetails 
        passList={passList} 
        currentIndex={currentIndex}
        updatePassList={UpdatePassList}
        handleClose={handleClose}
        handleError={handleError}
        />
      )
    } else if (canvasContent == "add_pass") {
      return <PasswordCreator 
        updatePasswordList={AddToPassList}
        handleClose={handleClose} 
        handleError={handleError}
        />
    }
  }

  return (
    <Offcanvas show={show} onHide={handleClose} id="offCanvasWindow" placement='end' className='w-75 bg-dark text-light'>
      {renderCanvasContent()}
    </Offcanvas>
  );
}

function Body() {
  const [passwordList, setPasswordList] = useState<Array<PasswordListItem>>([]);
  const [filterString, setFilterString] = useState<string>("");
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [currentPassIndex, setCurrentPassIndex] = useState<number>(0);
  const [canvasContent, setCanvasContent] = useState<string>("details");
  const [bodyContent, setBodyContent] = useState<string>("passbank");
  const [errorCode, setErrorCode] = useState<string>("");
  const [errorMessageShort, setErrorMessageShort] = useState<string>("");
  const [errorMessageFull, setErrorMessageFull] = useState<string>("");
  const user = useAuth();


  function handleError(errorCode: string, errorMessageShort:string, errorMessageFull:string) {
    setErrorCode(errorCode);
    setErrorMessageShort(errorMessageShort);
    setErrorMessageFull(errorMessageFull);
    setBodyContent("error")
  }
  
  function AddToPasswordList({id, site_favicon, username, email, password, url, salt, iv}: PasswordListItem) {
    // add password on backend
    const newArr = [...passwordList];
    newArr.push({
      id: id,
      site_favicon: site_favicon,
      username: username,
      email: email,
      password: password,
      url: url,
      salt: salt,
      iv: iv
    });
    setPasswordList(newArr);
    setBodyContent("passbank");
  }

  function UpdatePasswordList({id, site_favicon, username, email, password, url, salt, iv}: PasswordListItem, operation: string) {
    if (operation == "update") {
      const newPassList = passwordList.map((passItem) => {
        if (passItem.id == id) {
            return {
              id: id,
              site_favicon: site_favicon,
              username: username,
              email: email,
              password: password,
              url: url,
              salt: salt,
              iv: iv
            };
        } else {
          return passItem;
        }
      })
      setPasswordList([...newPassList]);
    } else if (operation == "delete") {
      const newPassList = passwordList.filter(passItem => passItem.id !== id);
      setPasswordList([...newPassList])
    }
  }

  function onPassItemClick(index: number) {
    setCurrentPassIndex(index);
    setCanvasContent("details");
    setShowOffcanvas(true);
  }

  function onGeneratorClick() {
    setBodyContent("generator");
  }

  function onBankClick() {
    setBodyContent("passbank");
  }

  function onNewPasswordClick() {
    setShowOffcanvas(true);
    setCanvasContent("add_pass");
  }

  function renderBody() {
    if (!user.jwt) {
      return <Login/>
    }
    else if (bodyContent == "passbank") {
      return (
        <>
          <Navigation onGeneratorClick={onGeneratorClick} onBankClick={onBankClick} onNewPasswordClick={onNewPasswordClick}/>
          <Search filterPL={setFilterString}/>
          <PassBank 
          filterString={filterString}
          passwordList={passwordList}
          onPassItemClick={onPassItemClick}
          setPassList={setPasswordList}
          />
          <OffCanvasWindow
            canvasContent={canvasContent} 
            passList={passwordList} 
            currentIndex={currentPassIndex} 
            show={showOffcanvas} 
            setShow={setShowOffcanvas}
            AddToPassList={AddToPasswordList}
            UpdatePassList={UpdatePasswordList}
            handleError={handleError}
          />
        </>
      );
    } 
    else if (bodyContent == "generator") {
      return (
        <>
          <Navigation onGeneratorClick={onGeneratorClick} onBankClick={onBankClick} onNewPasswordClick={onNewPasswordClick}/>
          <div className='container'>
            <Generator readonlyPassword={true}/>
          </div>
          <OffCanvasWindow 
            canvasContent={canvasContent} 
            passList={passwordList} 
            currentIndex={currentPassIndex} 
            show={showOffcanvas} 
            setShow={setShowOffcanvas}
            AddToPassList={AddToPasswordList}
            UpdatePassList={UpdatePasswordList}
            handleError={handleError}
          />
        </>
      )
    } else {
      return (
        <ErrorPage 
          errorCode={errorCode} 
          errorMessageShort={errorMessageShort} 
          errorMessageFull={errorMessageFull}/>
      )
    }
  }

  return (
    <>
          {renderBody()}
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className='App'>
        <Body/>
      </div>
    </AuthProvider>
  )
}

export default App
