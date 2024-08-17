import './App.css'
import Generator from './Generator'

function Navigation() {
  return (
    <header className="px-3 py-1 mb-1 bg-dark text-white">
      <div className='container-fluid'>
        <div className='d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start'>
          <ul className="nav nav-underline d-flex align-items-center me-lg-auto">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="#">Bank</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Generator</a>
            </li>
          </ul>
          <button type="button" className="btn btn-outline-primary mx-2 align-items-center">New</button>
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
        <PassBankItem site_favicon='public/vite.svg' siteURL='www.placeholder.com' email='placeholder@email.com' username=''/>
        <PassBankItem site_favicon='public/vite.svg' siteURL='www.placeholder.com' email='placeholder@email.com' username=''/>
      </div>
    </div>
  )
}

function PassDetails() {
  return (
    <div className="offcanvas offcanvas-end" tabIndex={-1} id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="offcanvasExampleLabel">Offcanvas</h5>
        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body">
        <div>
          Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc.
        </div>
        <div className="dropdown mt-3">
          <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown">
            Dropdown button
          </button>
          <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <li><a className="dropdown-item" href="#">Action</a></li>
            <li><a className="dropdown-item" href="#">Another action</a></li>
            <li><a className="dropdown-item" href="#">Something else here</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <>
      <div className='App'>
        <Navigation/>
        <PassBank/>
        <PassDetails/>
      </div>
    </>
  )
}

export default App
