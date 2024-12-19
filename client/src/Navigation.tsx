import { useState } from 'react';
import classNames from "classnames";
import { navigationProps } from './types';

export function Navigation({ onGeneratorClick, onBankClick, onNewPasswordClick }: navigationProps) {
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
