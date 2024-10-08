import { HTMLInputTypeAttribute, useEffect, useState, createContext, useContext, Children } from 'react';
import './App.css'
import Generator from './Generator'
import { PassDetails, EditButton } from './PassDetails';
import { deriveKey, encryptPassword, decryptPassword, base64ToUint8Array } from './utils/encryption';
import {useForm, FormProvider, useFormContext } from "react-hook-form"
import { ErrorMessage } from "@hookform/error-message";
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useAddPassword } from './utils/addPassword';
import { PasswordItem, PasswordListItem } from './types';
import { AuthProvider, useAuth } from "./AuthProvider";
import { Login } from './Login';
import { ErrorPage } from './ErrorPage';
import Spinner from 'react-bootstrap/Spinner';


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

interface passBankProps {
  passwordList: Array<PasswordListItem>,
  filterString: string,
  onPassItemClick: (index: number) => void,
  setPassList: (passList: Array<PasswordListItem>) => void,
}

interface passBankItemProps {
  key: number,
  index: number,
  passItem: PasswordListItem,
  onPassItemClick: (index: number) => void,
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
  return (
    <header className="px-3 py-1 mb-1 bg-dark text-white">
      <div className='container-fluid'>
        <div className='d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start'>
          <ul className="nav nav-underline d-flex align-items-center me-lg-auto">
            <li className="nav-item">
              <button type="button" className="nav-link active" aria-current="page" onClick={onBankClick}>Bank</button>
            </li>
            <li className="nav-item">
              <button type="button" className="nav-link" onClick={onGeneratorClick}>Generator</button>
            </li>
          </ul>
          <button type="button" className="btn btn-outline-primary mx-2 align-items-center" onClick={onNewPasswordClick} data-bs-toggle="offcanvas" data-bs-target="#offCanvasWindow">New</button>
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
      <div className='container-fluid input-group mb-3'>
        <input className="form-control" type="text" id="generatedPassword" placeholder='Search' onChange={handleChange}></input>    
      </div>
    </>
  )
}

function LoadingAnimation() {
  return (
    <div className='container-fluid'>
      <Spinner animation='border' variant='light'/>
    </div>
  )
}

function PassBankItem({passItem, index, onPassItemClick}: passBankItemProps) {

  function handleClick() {
    onPassItemClick(index);
  }

  return (
    <button type="button" className="list-group-item list-group-item-action rounded-0" onClick={handleClick} data-bs-toggle="offcanvas" data-bs-target="#offCanvasWindow" aria-current="true">
      <div className="row">
        <div className="col-sm-1 fw-bold">
          <img src={passItem.site_favicon} alt="" className="rounded"></img>
        </div>
        <div className='col-sm-11'>
          <div className='row mx-auto justify-content-center'>
            {passItem.url}
          </div>
          <div className='row justify-content-center'>
            {passItem.email}
          </div>
        </div>
      </div>
    </button>
)
}

function PassBank({passwordList, filterString, onPassItemClick, setPassList}: passBankProps) {
  const user = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPassList = async () => {
      console.log(user);
      fetch('http://localhost:3001/getPasswords', {
        headers: {
          "Authorization": user.jwt,
        }
      }).then(res => {
        return res.json();
      }).then(async passList => {
        //console.log(passList);
        const masterKey = "secretpassword";
        for (let i=0; i < passList.length; i++) {
          const encryptedData = {
            iv: base64ToUint8Array(passList[i].iv),
            ciphertext: base64ToUint8Array(passList[i].encrypted_password)
          }
          //console.log(encryptedData)
          const password = await deriveKey(masterKey, passList[i].salt).then(key => {
            //console.log("encryption key", key);
            return decryptPassword(encryptedData, key);
          });
          passList[i]['password'] = password;
        }
        console.log(passList);
        setPassList(passList);
        setIsLoading(false);
      }).catch(err => {
        console.log("Error fetching password list: ",err);
        setPassList([])
      })
    };

    fetchPassList();
  }, [])

  function filterPasswordList(substring: string) {
    let newFilteredPL: Array<PasswordListItem> = [];

    if (substring == "") {
      return passwordList;
    } else {
      for (let passItem of passwordList) {
        let email = passItem.email.toLowerCase();
        let username = passItem.username.toLowerCase();
        let url = passItem.url.toLowerCase();
  
        if (email.includes(substring)
          || username.includes(substring)
          || url.includes(substring)) 
        {
          newFilteredPL.push(passItem);
        }
      }
      console.log(newFilteredPL);
      return newFilteredPL;
    }
  }

  const passBankItems: React.ReactNode = filterPasswordList(filterString).map((passItem, index) =>
    <PassBankItem passItem={passItem} key={passItem.id} index={index} onPassItemClick={onPassItemClick}/>
  );

  return (
    <div className='container-fluid'>
      <div className='list-group'>
        {(isLoading) ? <LoadingAnimation/> : passBankItems}
      </div>
    </div>
  )
}

export function Input({ label, type, id, placeholder, pattern, errorMessage }: IInputProps) {
  const { register, formState: {errors} } = useFormContext();

  return (
    <div className="container mb-3">
      <div className='container'>
        <label htmlFor={id} className="form-label">{label}</label>
      </div>
      <input type={type} className="form-control" id={id} placeholder={placeholder} {...register(id, {
        required: "This field is required",
        pattern: {
          value: pattern,
          message: errorMessage
        },
        })}/>
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

  return (
    <FormProvider {...methods}>
      <form onSubmit={e => e.preventDefault()} className="container" noValidate>
        <Input
          label="Username"
          type="text"
          id="username"
          placeholder="type your username..."
          pattern={/(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])/}
          errorMessage = "You must enter a username between 8 and 20 characters"
        />
        <Input
          label="Email"
          type="email"
          id="email"
          placeholder="example@email.com"
          pattern={/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/}
          errorMessage = "You must enter a valid email"
        />
        <Generator readonlyPassword={false}/>
        <Input
          label="Website URL"
          type="url"
          id="url"
          placeholder="https://www.placeholder.com"
          pattern={/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/}
          errorMessage = "You must enter a valid website URL"
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
        {/* <form onSubmit={addNewPassword} className="needs-validation" noValidate={true}>
          <div className="container mb-3">
            <label htmlFor="emailInput" className="form-label">Email address</label>
            <input type="email" className="form-control" id="emailInput" placeholder="name@example.com" name="email" required></input>
            <div className='username-validation'>
              Please choose a username.
            </div>
          </div>
          <div className="container mb-3">
            <label htmlFor="usernameInput" className="form-label">Username</label>
            <input type="us" className="form-control" id="usernameInput" aria-describedby="emailHelp" required></input>
          </div>
          <Generator readonlyPassword={false}/>
          <div className="container mb-3">
            <label htmlFor="urlInput" className="form-label">Website</label>
            <input type="url" className="form-control" id="urlInput" placeholder="https://www.placeholder.com" name="url"></input>
          </div>
          <button type="submit" className="btn btn-outline-secondary">Submit</button>
        </form> */}
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
      return <PasswordCreator updatePasswordList={AddToPassList} handleClose={handleClose} handleError={handleError}/>
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
          <Generator readonlyPassword={true}/>
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
