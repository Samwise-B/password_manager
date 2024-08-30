import { useEffect, useState } from 'react';
import {useForm, FormProvider, useFormContext} from "react-hook-form"
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
    const { register, formState: {errors}, setValue } = useFormContext();
    passwordInput = (
      <>
        <input className="form-control" type="text" id="generatedPassword" readOnly={isReadOnly} {...register(label, {
        onChange: onChangePassword,
        required: {
          value: true,
          message: "required"
        },
        })}/>
      </>
    );
    setValue("password", password);
    errorMessage = <ErrorMessage errors={errors} name={label}/>;
  }

  return (
    <>
      <label htmlFor="generatedPassword" className="form-label">Password</label>
      {errorMessage}
      <div className='PasswordText input-group mb-3'>
        {passwordInput}
        <button type='button' className="btn btn-outline-secondary" id="passwordRefresh" onClick={onRefreshClick}>Refresh</button>      
      </div>
    </>
  )
}

function PassLength({passLength, handleLength}: passLengthProps) {
  return (
    <div className='row g-2 align-items-center'>
      <div className='col-auto'>
        <label htmlFor="passwordLength" className="form-label">Length</label>
      </div>
      <div className='col-auto'>
        <input type="range" className="form-range" value={passLength} min={4} max={48} step={1} id="passwordLength" onChange={handleLength}></input>
      </div>
      <div className='col-auto'>
        <span className='form-text text-white'>{passLength}</span>
      </div>
    </div>
  )
}

function Checkbox({flagType, hasFlag, handleFlag}: checkboxProps) {

  return (
    <div className="form-check">
      <input className="form-check-input" type="checkbox" value="" id={flagType} onChange={handleFlag} checked={hasFlag}></input>
      <label className="form-check-label" htmlFor={flagType}>
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

  return (
    <div className='container-sm text-white'>
          <PasswordBox onRefreshClick={getPassword} password={password} onChangePassword={onChangePassword} isReadOnly={readonlyPassword}/>
          <PassLength passLength={passLength} handleLength={handleLength}/>
          <div className='mb-3'>
              <Checkbox flagType={"Letters"} hasFlag={hasLetters} handleFlag={handleHasLetters}/>
              <Checkbox flagType={"Digits"} hasFlag={hasDigits} handleFlag={handleHasDigits}/>
              <Checkbox flagType={"Symbols"} hasFlag={hasSymbols} handleFlag={handleHasSymbols}/>
          </div>
    </div>
  )
}