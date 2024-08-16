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

function App() {
  return (
    <>
      <div className='App'>
        <Navigation/>
        <Generator/>
      </div>
    </>
  )
}

export default App
