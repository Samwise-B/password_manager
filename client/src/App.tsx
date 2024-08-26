import { useEffect, useState } from 'react';
import './App.css'
import Generator from './Generator'


interface navigationProps {
  onGeneratorClick: () => void,
  onBankClick: () => void,
  onNewPasswordClick: () => void
}

interface passwordCreatorProps {
  updatePasswordList: ({site_favicon, username, email, password, url}: PasswordListItem) => void;
}

interface passBankProps {
  passwordList: Array<PasswordListItem>;
  setCurrentPassIndex: (itemIndex: number) => void;
  onPassItemClick: () => void;
}

interface passDetailProps {
  passItem: PasswordListItem;
}

interface passBankItemProps {
  index: number;
  site_favicon: string;
  username: string;
  email: string;
  url: string;
  setCurrentPassIndex: (itemIndex: number) => void;
  setCanvasContent: () => void;
}

interface OffCanvasProps {
  canvasContent: React.ReactNode;
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

function PassBankItem({index, site_favicon, url, email, username, setCurrentPassIndex, setCanvasContent}: passBankItemProps) {
  const [itemIndex, setItemIndex] = useState<number>(index);

  function handleClick() {
    setCurrentPassIndex(itemIndex);
    setCanvasContent();
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

function PassBank({passwordList, setCurrentPassIndex, onPassItemClick}: passBankProps) {
  const passBankItems: React.ReactNode = passwordList.map((passItem, index) => 
    <PassBankItem index={index} site_favicon='/vite.svg' email={passItem.email} username={passItem.username} url={passItem.url} setCurrentPassIndex={setCurrentPassIndex} setCanvasContent={onPassItemClick}/>
  );

  return (
    <div className='container-fluid'>
      <div className='list-group'>
        {passBankItems}
      </div>
    </div>
  )
}

function PassDetails({passItem} : passDetailProps) {
  const [passInputType, setPassInputType] = useState<string>("password");

  function handleShowPassword() {
    if (passInputType == "password") {
      setPassInputType("text");
    } else {
      setPassInputType("password");
    }
  }

  return (
    <>
      <div className="offcanvas-header">
        <button type="button" className="btn btn-outline-secondary">Edit</button>
        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body">
        <div className="container mb-3">
          <label htmlFor="emailInput" className="form-label">Email address</label>
          <input type="email" className="form-control" id="emailInput" value={passItem.email}></input>
        </div>
        <div className="container mb-3">
          <label htmlFor="inputPassword5" className="form-label">Password</label>
          <input type={passInputType} id="inputPassword5" className="form-control" value={passItem.password} aria-describedby="passwordHelpBlock"></input>
          <button type="button" className="btn btn-primary" onClick={handleShowPassword}>Show</button>
        </div>
        <div className="container mb-3">
          <label htmlFor="urlInput" className="form-label">Website</label>
          <input type="url" className="form-control" id="urlInput" value={passItem.url}></input>
        </div>
      </div>
    </>
  )
}

function PasswordCreator({updatePasswordList}: passwordCreatorProps) {
  function addNewPassword(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    console.log("test");
    const target = event.target as typeof event.target & {
      email: {value: string};
      password: {value: string};
      url: {value: string};
    }
    const site_favicon = "/vite.svg"
    const username = "placeholder"
    const email = target.email.value;
    const password = target.password.value;
    const url = target.url.value;
    console.log(email, password, url)
    updatePasswordList({site_favicon, username, email, password, url});
  }

  return (
    <>
      <div className="offcanvas-header">
        <button type="button" className="btn btn-outline-secondary">Edit</button>
        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body">
        <form onSubmit={addNewPassword}>
          <div className="container mb-3">
            <label htmlFor="emailInput" className="form-label">Email address</label>
            <input type="email" className="form-control" id="emailInput" placeholder="name@example.com" name="email"></input>
          </div>
          <Generator readonlyPassword={false}/>
          <div className="container mb-3">
            <label htmlFor="urlInput" className="form-label">Website</label>
            <input type="url" className="form-control" id="urlInput" placeholder="www.placeholder.com" name="url"></input>
          </div>
          <button type="submit" className="btn btn-primary">Submit</button>
        </form>
      </div>
    </>
  )
}

function OffCanvasWindow({canvasContent} : OffCanvasProps) {
  return (
    <div className="offcanvas offcanvas-end text-bg-dark w-100" tabIndex={-1} id="offCanvasWindow" aria-labelledby="offcanvasExampleLabel">
      {canvasContent}
    </div>
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
  const [currentPassIndex, setCurrentPassIndex] = useState<number>(0);
  const [canvasContent, setCanvasContent] = useState<React.ReactNode>(<PassDetails passItem={passwordList[currentPassIndex]}/>);
  const [bodyContent, setBodyContent] = useState<React.ReactNode>(<PassBank 
    onPassItemClick={onPassItemClick}
    setCurrentPassIndex={setCurrentPassIndex} passwordList={passwordList}/>);

  function updatePasswordList({site_favicon, username, email, password, url}: PasswordListItem) {
    setPasswordList(passwordList.concat({
      site_favicon: site_favicon,
      username: username,
      email: email,
      password: password,
      url: url
    }))
  }

  function onPassItemClick() {
    setCanvasContent(<PassDetails passItem={passwordList[currentPassIndex]}/>)
  }

  function onGeneratorClick() {
    setBodyContent(<Generator readonlyPassword={true}/>);
  }

  function onBankClick() {
    setBodyContent(<PassBank onPassItemClick={onPassItemClick} setCurrentPassIndex={setCurrentPassIndex} passwordList={passwordList}/>);
  }

  function onNewPasswordClick() {
    setCanvasContent(<PasswordCreator updatePasswordList={updatePasswordList}/>);
  }

  return (
    <>
      <div className='App'>
        <Navigation onGeneratorClick={onGeneratorClick} onBankClick={onBankClick} onNewPasswordClick={onNewPasswordClick}/>
        {bodyContent}
        <OffCanvasWindow canvasContent={canvasContent}/>
      </div>
    </>
  )
}

export default App
