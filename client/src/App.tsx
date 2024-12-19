import './css/App.css';
import './scss/styles.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState } from 'react';
import Generator from './Generator';
import { PasswordListItem } from './types';
import { AuthProvider, useAuth } from "./AuthProvider";
import { Login } from './Login';
import { ErrorPage } from './ErrorPage';
import { PassBank } from './PassBank';
import { OffCanvasWindow } from './CanvasWindow';
import { Navigation } from './Navigation';
import { Search } from './Search';


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
    if (!user.user) {
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
