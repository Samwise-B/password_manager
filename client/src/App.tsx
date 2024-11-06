import { useState } from 'react';
import './css/App.css';
import './scss/styles.scss';
import Generator from './Generator';
import { PassDetails } from './PassDetails';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { PasswordListItem } from './types';
import { AuthProvider, useAuth } from "./AuthProvider";
import { Login } from './Login';
import { ErrorPage } from './ErrorPage';
import { PassBank } from './PassBank';
import { PasswordCreator } from './PasswordCreator';
import 'bootstrap-icons/font/bootstrap-icons.css';
import classNames from "classnames";

export const endpoints = {
  getList: import.meta.env.VITE_API_GET_LIST,
  addPass: import.meta.env.VITE_API_ADD_PASS,
  updatePass: import.meta.env.VITE_API_UPDATE_PASS,
  deletePass: import.meta.env.VITE_API_DELETE_PASS,
  loginChallenge: import.meta.env.VITE_API_LOGIN_CHALLENGE,
  verifyChallenge: import.meta.env.VITE_API_LOGIN_VERIFY,
  register: import.meta.env.VITE_API_REGISTER,
  logout: import.meta.env.VITE_API_LOGOUT,
}

console.log("endpoints", endpoints);

export const apiHost = import.meta.env.VITE_API_HOST;
export const apiPort = import.meta.env.VITE_API_PORT ? import.meta.env.VITE_API_PORT : "";


interface navigationProps {
  onGeneratorClick: () => void,
  onBankClick: () => void,
  onNewPasswordClick: () => void
}

interface OffCanvasProps {
  //renderCanvasContent: () => React.ReactNode;
  show: boolean;
  setShow: (val: boolean) => void;
  canvasContent: string;
  passList: Array<PasswordListItem>;
  currentIndex: number;
  UpdatePassList: ({ id, username, email, password, url, label, salt, iv }: PasswordListItem, operation: string) => void;
  AddToPassList: ({ id, username, email, label, password, url, salt, iv }: PasswordListItem) => void;
  handleError: (errorCode: string, errorMessageShort: string, errorMessageFull: string) => void;
}

interface ISearchBarProps {
  filterPL: (substring: string) => void;
}

function Navigation({ onGeneratorClick, onBankClick, onNewPasswordClick }: navigationProps) {
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

function Search({ filterPL }: ISearchBarProps) {

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

function OffCanvasWindow({ canvasContent, passList, currentIndex, UpdatePassList, AddToPassList, show, setShow, handleError }: OffCanvasProps) {

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


  function handleError(errorCode: string, errorMessageShort: string, errorMessageFull: string) {
    setErrorCode(errorCode);
    setErrorMessageShort(errorMessageShort);
    setErrorMessageFull(errorMessageFull);
    setBodyContent("error")
  }

  function AddToPasswordList({ id, username, email, label, password, url, salt, iv }: PasswordListItem) {
    // add password on backend
    const newArr = [...passwordList];
    newArr.push({
      id: id,
      username: username,
      email: email,
      label: label,
      password: password,
      url: url,
      salt: salt,
      iv: iv
    });
    setPasswordList(newArr);
    setBodyContent("passbank");
  }

  function UpdatePasswordList({ id, username, email, password, url, label, salt, iv }: PasswordListItem, operation: string) {
    if (operation == "update") {
      const newPassList = passwordList.map((passItem) => {
        if (passItem.id == id) {
          return {
            id: id,
            username: username,
            email: email,
            label: label,
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
      return <Login />
    }
    else if (bodyContent == "passbank") {
      return (
        <>
          <Navigation onGeneratorClick={onGeneratorClick} onBankClick={onBankClick} onNewPasswordClick={onNewPasswordClick} />
          <Search filterPL={setFilterString} />
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
          <Navigation onGeneratorClick={onGeneratorClick} onBankClick={onBankClick} onNewPasswordClick={onNewPasswordClick} />
          <div className='container'>
            <Generator readonlyPassword={true} />
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
          errorMessageFull={errorMessageFull} />
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
        <Body />
      </div>
    </AuthProvider>
  )
}

export default App
