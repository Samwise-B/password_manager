import { useEffect, useState } from 'react';
import { useFormContext} from "react-hook-form"
import { ErrorMessage } from "@hookform/error-message";
import { generatePassword } from './utils/generatePassword';

interface generatorProps {
  readonlyPassword: boolean;
}

interface passBoxProps  {
  password: string;
  isReadOnly: boolean;
  onRefreshClick: () => void;
  onChangePassword: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface checkboxProps {
  flagType: string;
  hasFlag: boolean;
  handleFlag: () => void;
}

interface passLengthProps {
  passLength: number;
  handleLength: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function PasswordBox({password, isReadOnly, onRefreshClick, onChangePassword} : passBoxProps) {
  const label = "password";
  let passwordInput;
  let errorMessage;
  
  if (isReadOnly) {
    passwordInput = (
      <input className="form-control" type="text" value={password} id="generatedPassword" onChange={onChangePassword} readOnly={isReadOnly}/>
    )
  } else {
    const { register, setValue } = useFormContext();
    passwordInput = (
      <>
        <input className="form-control" type="text" id="generatedPassword" readOnly={isReadOnly} {...register(label, {
        onChange: onChangePassword,
        required: {
          value: true,
          message: "A password is required"
        },
        maxLength: {
          value: 48,
          message: "Password must be no more than 48 characters."
        }
        })}/>
      </>
    );
    setValue("password", password);
  }

  return (
    <div className="pt-3">
      {errorMessage}
      <label htmlFor="passwordLength" className="form-label text-light">Password</label>
      <div className='PasswordText input-group mb-3'>
        {passwordInput}
        <button type='button' className="btn btn-outline-secondary" id="passwordRefresh" onClick={onRefreshClick}>Refresh</button>      
      </div>
    </div>
  )
}

function PassLength({passLength, handleLength}: passLengthProps) {
  return (
    <div className='container'>
      <div className='row'>
        <div className='col-1'>
          <label htmlFor="passwordLength" className="form-label text-light">Length</label>
        </div>
        <div className='col-10'>
          <input type="range" className="form-range" value={passLength} min={4} max={48} step={1} id="passwordLength" onChange={handleLength}></input>
        </div>
        <div className='col-1'>
          <span className='form-text text-light'>{passLength}</span>
        </div>
      </div>
    </div>
  )
}

function Checkbox({flagType, hasFlag, handleFlag}: checkboxProps) {

  return (
    <div className="form-check form-switch d-flex align-items-start">
      <input className="form-check-input mx-1" type="checkbox" value="" id={flagType} onChange={handleFlag} checked={hasFlag}></input>
      <label className="form-check-label d-inline text-light mx-3" htmlFor={flagType}>
        {flagType}
      </label>
    </div>
  )
}

export default function Generator({readonlyPassword} : generatorProps) {
  const [hasLetters, setHasLetters] = useState<boolean>(true);
  const [hasDigits, setHasDigits] = useState<boolean>(true);
  const [hasSymbols, setHasSymbols] = useState<boolean>(false);
  const [passLength, setPassLength] = useState<number>(10);

  const [password, setPass] = useState<string>("");

  useEffect(() => {
    setPass(generatePassword({passLength, hasLetters, hasDigits, hasSymbols}));
  }, [hasLetters, hasDigits, hasSymbols, passLength]);

  function getPassword() {
    let pass_tmp = generatePassword({passLength, hasLetters, hasDigits, hasSymbols});
    setPass(pass_tmp);
  }

  function onChangePassword(e: React.ChangeEvent<HTMLInputElement>) {
    setPass(e.target.value);
  }

  function handleHasLetters() {
    setHasLetters(!hasLetters);
  }

  function handleHasDigits() {
    setHasDigits(!hasDigits);
  }

  function handleHasSymbols() {
    setHasSymbols(!hasSymbols);
  }

  function handleLength(event: React.ChangeEvent<HTMLInputElement>) {
    setPassLength(parseInt(event.target.value));
  }

  function renderErrorMessage() {
    if (!readonlyPassword) {
      const { formState: {errors} } = useFormContext();
      return (<ErrorMessage
        errors={errors}
        name="password"
        render={({ messages }) => 
          messages &&
          Object.entries(messages).map(([type, message]) => (
            <p className="text-danger" key={type}>{message}</p>
          ))
        }
      />)
    }
  }

  return (
    <div className='container-fluid text-secondary border-top border-secondary'>
      <PasswordBox onRefreshClick={getPassword} password={password} onChangePassword={onChangePassword} isReadOnly={readonlyPassword}/>
      <PassLength passLength={passLength} handleLength={handleLength}/>
      <div className='mb-3'>
        <Checkbox flagType={"Letters"} hasFlag={hasLetters} handleFlag={handleHasLetters}/>
        <Checkbox flagType={"Digits"} hasFlag={hasDigits} handleFlag={handleHasDigits}/>
        <Checkbox flagType={"Symbols"} hasFlag={hasSymbols} handleFlag={handleHasSymbols}/>
      </div>
      {renderErrorMessage()}
    </div>
      
  )
}