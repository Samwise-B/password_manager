import { useState, useEffect } from "react";
import { base64ToUint8Array, deriveKey, decryptPassword } from "./utils/encryption";
import { useAuth } from "./AuthProvider";
import { LoadingAnimation } from "./LoadingAnimation";
import { passBankProps, passBankItemProps, PasswordListItem } from "./types";

export function PassBank({passwordList, filterString, onPassItemClick, setPassList}: passBankProps) {
    const user = useAuth();
    const [isLoading, setIsLoading] = useState<boolean>(true);
  
    useEffect(() => {
      const fetchPassList = async () => {
        console.log(user);
        fetch('http://localhost:3001/getPasswords', {
          headers: {
            "Authorization": user.jwt,
          }
        }).then(res => {
          return res.json();
        }).then(async passList => {
          //console.log(passList);
          const masterKey = "secretpassword";
          for (let i=0; i < passList.length; i++) {
            const encryptedData = {
              iv: base64ToUint8Array(passList[i].iv),
              ciphertext: base64ToUint8Array(passList[i].encrypted_password)
            }
            //console.log(encryptedData)
            const password = await deriveKey(masterKey, passList[i].salt).then(key => {
              //console.log("encryption key", key);
              return decryptPassword(encryptedData, key);
            });
            passList[i]['password'] = password;
          }
          console.log(passList);
          setPassList(passList);
          setIsLoading(false);
        }).catch(err => {
          console.log("Error fetching password list: ",err);
          setPassList([])
        })
      };
  
      fetchPassList();
    }, [])
  
    function filterPasswordList(substring: string) {
      let newFilteredPL: Array<PasswordListItem> = [];
  
      if (substring == "") {
        return passwordList;
      } else {
        for (let passItem of passwordList) {
          let email = passItem.email.toLowerCase();
          let username = passItem.username.toLowerCase();
          let url = passItem.url.toLowerCase();
    
          if (email.includes(substring)
            || username.includes(substring)
            || url.includes(substring)) 
          {
            newFilteredPL.push(passItem);
          }
        }
        console.log(newFilteredPL);
        return newFilteredPL;
      }
    }
  
    const passBankItems: React.ReactNode = filterPasswordList(filterString).map((passItem, index) =>
      <PassBankItem passItem={passItem} key={passItem.id} index={index} onPassItemClick={onPassItemClick}/>
    );
  
    return (
      <div className='container-fluid px-0'>
        <div className='list-group'>
          {(isLoading) ? <LoadingAnimation/> : passBankItems}
        </div>
      </div>
    )
}


export function PassBankItem({passItem, index, onPassItemClick}: passBankItemProps) {

    function handleClick() {
        onPassItemClick(index);
    }
    
    return (
        <button type="button" className="list-group-item list-group-item-action rounded-0 bg-dark border-dark pass-item" onClick={handleClick} data-bs-toggle="offcanvas" data-bs-target="#offCanvasWindow" aria-current="true">
        <div className="row">
            <div className="col-sm-1 fw-bold">
            <i className="bi bi-key-fill h1"></i>
            </div>
            <div className='col-sm-11'>
            <div className='row mx-auto justify-content-center'>
                {passItem.url}
            </div>
            <div className='row justify-content-center'>
                {passItem.email}
            </div>
            </div>
        </div>
        </button>
    )
}