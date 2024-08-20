import { useEffect, useState } from 'react';
import './App.css'
import Generator from './Generator'

type navigationProps = {
  onGeneratorClick: () => void,
  onBankClick: () => void,
  onNewPasswordClick: () => void
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
          <button type="button" className="btn btn-outline-primary mx-2 align-items-center" onClick={onNewPasswordClick}>New</button>
        </div>
      </div>
      <div className='input-group mb-3'>
        <input className="form-control" type="text" id="generatedPassword" placeholder='Search'></input>    
      </div>
    </header>
  )
}

type PassBankItemProps = {
  site_favicon: string;
  siteURL: string;
  email: string;
  username: string;
}

function PassBankItem({site_favicon, siteURL, email, username}: PassBankItemProps) {
  return (
    <button type="button" className="list-group-item list-group-item-action rounded-0" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-current="true">
      <div className="row">
        <div className="col-sm-1 fw-bold">
          <img src={site_favicon} alt="" className="rounded"></img>
        </div>
        <div className='col-sm-11'>
          <div className='row mx-auto justify-content-center'>
            {siteURL}
          </div>
          <div className='row justify-content-center'>
            {email}
          </div>
        </div>
      </div>
    </button>
)
}

function PassBank() {
  return (
    <div className='container-fluid'>
      <div className='list-group'>
        <PassBankItem site_favicon='/vite.svg' siteURL='www.placeholder.com' email='placeholder@email.com' username=''/>
        <PassBankItem site_favicon='/vite.svg' siteURL='www.placeholder.com' email='placeholder@email.com' username=''/>
      </div>
    </div>
  )
}

function PassDetails() {
  return (
    <div className="offcanvas offcanvas-end text-bg-dark w-100" tabIndex={-1} id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
      <div className="offcanvas-header">
        <button type="button" className="btn btn-outline-secondary">Edit</button>
        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body">
        <div className="container mb-3">
          <label htmlFor="emailInput" className="form-label">Email address</label>
          <input type="email" className="form-control" id="emailInput" placeholder="name@example.com"></input>
        </div>
        <div className="container mb-3">
          <label htmlFor="inputPassword5" className="form-label">Password</label>
          <input type="password" id="inputPassword5" className="form-control" aria-describedby="passwordHelpBlock"></input>
        </div>
        <div className="container mb-3">
          <label htmlFor="urlInput" className="form-label">Website</label>
          <input type="url" className="form-control" id="urlInput" placeholder="www.placeholder.com"></input>
        </div>
      </div>
    </div>
  )
}

function PasswordCreator() {
  function addNewPassword(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    console.log("test");
    const target = event.target as typeof event.target & {
      email: {value: string};
      password: {value: string};
      url: {value: string};
    }
    const email = target.email.value;
    const password = target.password.value;
    const url = target.url.value;
    console.log(email, password, url)
  }

  return (
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
  )
}

function App() {
  const [bodyContent, setBodyContent] = useState<React.ReactNode>(<PassBank/>);

  function onGeneratorClick() {
    setBodyContent(<Generator readonlyPassword={true}/>);
  }

  function onBankClick() {
    setBodyContent(<PassBank/>);
  }

  function onNewPasswordClick() {
    setBodyContent(<PasswordCreator/>);
  }

  return (
    <>
      <div className='App'>
        <Navigation onGeneratorClick={onGeneratorClick} onBankClick={onBankClick} onNewPasswordClick={onNewPasswordClick}/>
        {bodyContent}
        <PassDetails/>
      </div>
    </>
  )
}

export default App
