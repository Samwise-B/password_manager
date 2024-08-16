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

function PassBank() {
  return (
    <div className='container-fluid'>
      <ul className="list-group">
        <li className="list-group-item">
        <div className="row">
          <div className="col-sm-1 fw-bold">favicon</div>
          <div className='col-sm-11'>
            <div className='row mx-auto justify-content-center'>
              www.placeholder.com
            </div>
            <div className='row justify-content-center'>
              placeholder@gmail.com
            </div>
          
          </div>
          
        </div>
        </li>
        <li className="list-group-item">A second item</li>
        <li className="list-group-item">A third item</li>
        <li className="list-group-item">A fourth item</li>
        <li className="list-group-item">And a fifth one</li>
      </ul>
    </div>
  )
}

function App() {
  return (
    <>
      <div className='App'>
        <Navigation/>
        <PassBank/>
      </div>
    </>
  )
}

export default App
