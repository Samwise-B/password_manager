import { useEffect, useState } from 'react';

type passBoxProps = {
  password: string;
  onRefreshClick: () => void;
}

type checkboxProps = {
  flagType: string;
  hasFlag: boolean;
  handleFlag: () => void;
}

type passLengthProps = {
  passLength: number;
  handleLength: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function PasswordBox({onRefreshClick, password} : passBoxProps) {
  
  return (
    <div className='PasswordText input-group mb-3'>
      <input className="form-control" type="text" value={password} id="generatedPassword" disabled readOnly></input>
      <span className="input-group-text" id="passwordRefresh" onClick={onRefreshClick}>@</span>         
    </div>
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
        <span className='form-text'>{passLength}</span>
      </div>
    </div>
  )
}

function Checkbox({flagType, hasFlag, handleFlag}: checkboxProps) {

  return (
    <div className="form-check">
      <input className="form-check-input" type="checkbox" value="" id="hasLetters" onClick={handleFlag} checked={hasFlag}></input>
      <label className="form-check-label" htmlFor="hasLetters">
        {flagType}
      </label>
    </div>
  )
}

export default function Generator() {
  const [hasLetters, setHasLetters] = useState<boolean>(true);
  const [hasDigits, setHasDigits] = useState<boolean>(true);
  const [hasSymbols, setHasSymbols] = useState<boolean>(true);
  const [passLength, setPassLength] = useState<number>(10);

  const [password, setPass] = useState<string>("");

  useEffect(() => {
    generatePassword();
  }, [hasLetters, hasDigits, hasSymbols, passLength]);

  function generatePassword() {
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digits = "0123456789";
    const symbols = ";@#!?~";
    let chars = "";
    if (hasLetters) {
      chars += letters;
    }
    if (hasDigits) {
      chars += digits;
    }
    if (hasSymbols) {
      chars += symbols;
    }

    if (chars == "") {
      setPass("");
    }
    else {
      const num_chars = chars.length;

      const pass_ints = new Uint32Array(passLength);
      const pass_buff = window.crypto.getRandomValues(pass_ints);
      console.log("numchars", num_chars, pass_buff)
      let pass: string = "";
      pass_buff.forEach((i) => {
        pass += chars[i % num_chars];
        console.log(i % num_chars)
      });
      console.log(pass);
      setPass(pass);
    }
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
    <div className='Generator'>
          <PasswordBox onRefreshClick={generatePassword} password={password}/>
          <PassLength passLength={passLength} handleLength={handleLength}/>
          <div className='mb-3'>
            <Checkbox flagType={"Letters"} hasFlag={hasLetters} handleFlag={handleHasLetters}/>
            <Checkbox flagType={"Digits"} hasFlag={hasDigits} handleFlag={handleHasDigits}/>
            <Checkbox flagType={"Symbols"} hasFlag={hasSymbols} handleFlag={handleHasSymbols}/>
          </div>
        </div>
  )
}