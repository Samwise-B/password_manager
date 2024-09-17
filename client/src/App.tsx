import { HTMLInputTypeAttribute, useEffect, useState } from 'react';
import './App.css'
import Generator from './Generator'
import {useForm, FormProvider, useFormContext, FieldError, FieldErrorsImpl} from "react-hook-form"
import { ErrorMessage } from "@hookform/error-message";
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button';

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
  updatePasswordList: ({site_favicon, username, email, password, url}: PasswordListItem) => void;
}

interface passBankProps {
  passwordList: Array<PasswordListItem>;
  onPassItemClick: (index: number) => void;
}

interface passDetailProps {
  passList: Array<PasswordListItem>,
  currentIndex: number
}

interface passBankItemProps {
  index: number;
  site_favicon: string;
  username: string;
  email: string;
  url: string;
  onPassItemClick: (index: number) => void;
}

interface OffCanvasProps {
  renderCanvasContent: () => React.ReactNode;
  show: boolean;
  setShow: (val: boolean) => void;
}

type PasswordListItem = {
  site_favicon: string;
  username: string;
  email: string;
  password: string;
  url: string;
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
      <div className='input-group mb-3'>
        <input className="form-control" type="text" id="generatedPassword" placeholder='Search'></input>    
      </div>
    </header>
  )
}

function PassBankItem({index, site_favicon, url, email, username, onPassItemClick}: passBankItemProps) {

  function handleClick() {
    onPassItemClick(index);
  }

  return (
    <button type="button" className="list-group-item list-group-item-action rounded-0" onClick={handleClick} data-bs-toggle="offcanvas" data-bs-target="#offCanvasWindow" aria-current="true">
      <div className="row">
        <div className="col-sm-1 fw-bold">
          <img src={site_favicon} alt="" className="rounded"></img>
        </div>
        <div className='col-sm-11'>
          <div className='row mx-auto justify-content-center'>
            {url}
          </div>
          <div className='row justify-content-center'>
            {email}
          </div>
        </div>
      </div>
    </button>
)
}

function PassBank({passwordList, onPassItemClick}: passBankProps) {
  const passBankItems: React.ReactNode = passwordList.map((passItem, index) => 
    <PassBankItem index={index} site_favicon='/vite.svg' email={passItem.email} username={passItem.username} url={passItem.url} onPassItemClick={onPassItemClick}/>
  );

  return (
    <div className='container-fluid'>
      <div className='list-group'>
        {passBankItems}
      </div>
    </div>
  )
}

function PassDetails({passList, currentIndex} : passDetailProps) {
  const [passInputType, setPassInputType] = useState<string>("password");
  const passItem = passList[currentIndex];
  console.log(passItem);

  function handleShowPassword() {
    if (passInputType == "password") {
      setPassInputType("text");
    } else {
      setPassInputType("password");
    }
  }

  return (
    <>
      {/* <div className="offcanvas-header">
        <button type="button" className="btn btn-outline-secondary">Edit</button>
        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div> */}
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Password Details</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="container mb-3">
          <label htmlFor="emailInput" className="form-label">Email address</label>
          <input type="email" className="form-control" id="emailInput" value={passItem.email}></input>
        </div>
        <div className="container mb-3">
          <label htmlFor="usernameInput" className="form-label">Username</label>
          <input type="text" className="form-control" id="emailInput" value={passItem.username}></input>
        </div>
        <label htmlFor="inputPassword5" className="form-label">Password</label>
        <div className="container input-group mb-3">
          <input type={passInputType} id="inputPassword5" className="form-control" value={passItem.password} aria-describedby="passwordHelpBlock"></input>
          <button type="button" className="btn btn-primary" onClick={handleShowPassword}>Show</button>
        </div>
        <div className="container mb-3">
          <label htmlFor="urlInput" className="form-label">Website</label>
          <input type="url" className="form-control" id="urlInput" value={passItem.url}></input>
        </div>
      </Offcanvas.Body>
    </>
  )
}

function Input({ label, type, id, placeholder, pattern, errorMessage }: IInputProps) {
  const { register, formState: {errors} } = useFormContext();

  return (
    <div className="container mb-3">
      <div className='container mb-3'>
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
            <p key={type}>{message}</p>
          ))
        }
      />
    </div>
  );
}

function NewPasswordForm({updatePasswordList}: passwordCreatorProps) {
  const methods = useForm({
    criteriaMode: "all"
  });

  const onSubmit = methods.handleSubmit(data => {
    console.log(data);
    const site_favicon = "/vite.svg"
    const username = data.username;
    const email = data.email;
    const password = data.password;
    const url = data.url
    updatePasswordList({site_favicon, username, email, password, url});
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

function PasswordCreator({updatePasswordList}: passwordCreatorProps) {
  function addNewPassword(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;

    if (!form.checkValidity()) {
      event.stopPropagation();
    }
    console.log("test");
    const target = event.target as typeof event.target & {
      email: {value: string};
      password: {value: string};
      url: {value: string};
      username: {value:string};
    }
    const site_favicon = "/vite.svg"
    const username = target.username.value;
    const email = target.email.value;
    const password = target.password.value;
    const url = target.url.value;
    console.log(email, password, url)
    updatePasswordList({site_favicon, username, email, password, url});
  }

  return (
    <>
      <div className="offcanvas-header">
        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body">
        <NewPasswordForm updatePasswordList={updatePasswordList}/>
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
      </div>
    </>
  )
}

function OffCanvasWindow({renderCanvasContent, show, setShow} : OffCanvasProps) {

  const handleClose = () => {
    console.log("handle close");
    setShow(false);
  }
  return (
    <Offcanvas show={show} onHide={handleClose} id="offCanvasWindow">
      {renderCanvasContent()}
    </Offcanvas>
  );
}

function App() {
  const [passwordList, setPasswordList] = useState<Array<PasswordListItem>>([
    {
      site_favicon: "/vite.svg",
      username: "placeholder",
      email: "placeholder@gmail.com",
      password: "test123",
      url: "https://www.google.com"
    }
  ]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [currentPassIndex, setCurrentPassIndex] = useState<number>(0);
  const [canvasContent, setCanvasContent] = useState<string>("details");
  const [bodyContent, setBodyContent] = useState<React.ReactNode>(
    <PassBank 
      onPassItemClick={onPassItemClick}
      passwordList={passwordList}/>);
  

  function updatePasswordList({site_favicon, username, email, password, url}: PasswordListItem) {
    const newArr = [...passwordList];
    newArr.push({
      site_favicon: site_favicon,
      username: username,
      email: email,
      password: password,
      url: url
    });
    setPasswordList(newArr);
    setBodyContent(<PassBank onPassItemClick={onPassItemClick} passwordList={newArr}/>);
  }

  function onPassItemClick(index: number) {
    setCurrentPassIndex(index);
    setCanvasContent("details");
    setShowOffcanvas(true);
  }

  function onGeneratorClick() {
    setBodyContent(<Generator readonlyPassword={true}/>);
  }

  function onBankClick() {
    setBodyContent(<PassBank 
      onPassItemClick={onPassItemClick}  
      passwordList={passwordList}/>);
  }

  function onNewPasswordClick() {
    setShowOffcanvas(true);
    setCanvasContent("add_pass");
  }

  function renderCanvasContent() {
    if (canvasContent == "details") {
      return (
        <PassDetails 
        passList={passwordList} 
        currentIndex={currentPassIndex}/>
      )
    } else if (canvasContent == "add_pass") {
      return <PasswordCreator updatePasswordList={updatePasswordList}/>
    }
  }

  return (
    <>
      <div className='App'>
        <Navigation onGeneratorClick={onGeneratorClick} onBankClick={onBankClick} onNewPasswordClick={onNewPasswordClick}/>
        {bodyContent}
        <OffCanvasWindow renderCanvasContent={renderCanvasContent} show={showOffcanvas} setShow={setShowOffcanvas}/>
      </div>
    </>
  )
}

export default App
