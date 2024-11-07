import { useState, useEffect } from "react";
import { base64ToUint8Array, decryptPassword } from "./utils/encryption";
import { useAuth } from "./AuthProvider";
import { LoadingAnimation } from "./LoadingAnimation";
import { passBankProps, passBankItemProps, PasswordListItem, EmptyPassListProps } from "./types";
import { apiHost, endpoints } from "./App";

export function PassBank({ passwordList, filterString, onPassItemClick, setPassList }: passBankProps) {
  const user = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPassList = async () => {
      console.log(user);
      fetch(`${apiHost}/${endpoints.getList}`, {
        credentials: 'include',
        // headers: {
        //   "Authorization": user.jwt,
        // }

      }).then(res => {
        return res.json();
      }).then(async passList => {
        console.log("fetched passwords", passList);
        const masterKey = user.masterKey;
        console.log(masterKey)
        if (!masterKey) {
          throw new Error(`error: masterKey is undefined`);
        }
        for (let i = 0; i < passList.length; i++) {
          const encryptedData = {
            iv: base64ToUint8Array(passList[i].iv),
            ciphertext: base64ToUint8Array(passList[i].encrypted_pass)
          }
          //console.log(encryptedData)
          const password = await decryptPassword(encryptedData, masterKey);
          passList[i]['password'] = password;
        }
        console.log(passList);
        setPassList(passList);
        setIsLoading(false);
      }).catch(err => {
        console.log("Error fetching password list: ", err);
        setPassList([])
      })
    };

    fetchPassList();
  }, [user])

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
          || url.includes(substring)) {
          newFilteredPL.push(passItem);
        }
      }
      console.log(newFilteredPL);
      return newFilteredPL;
    }
  }

  function renderBank() {
    const passBankItems = filterPasswordList(filterString);
    const passItemsNode: React.ReactNode = passBankItems.map((passItem, index) =>
      <PassBankItem passItem={passItem} key={passItem.id} index={index} onPassItemClick={onPassItemClick} />
    );
    if (isLoading) {
      return <LoadingAnimation />
    }
    else if (passBankItems.length == 0) {
      if (filterString == "") {
        return <EmptyPassList
          header={"No Passwords!"}
          description={"Your password list is empty, press the + in the top right to add a password."}
        />
      } else {
        return <EmptyPassList
          header={"No Results"}
          description={"Your filter did not match any entries in your bank."}
        />
      }

    }
    else {
      return passItemsNode;
    }
  }

  return (
    <div className='container-fluid px-0'>
      <div className='list-group'>
        {renderBank()}
      </div>
    </div>
  )
}


export function PassBankItem({ passItem, index, onPassItemClick }: passBankItemProps) {

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
            {passItem.email || passItem.username}
          </div>
          <div className='row justify-content-center'>
            {passItem.url || passItem.label}
          </div>
        </div>
      </div>
    </button>
  )
}

function EmptyPassList({ header, description }: EmptyPassListProps) {
  return (
    <div className="container py-3 text-light">
      <img src="/empty_list.svg"></img>
      <h2>{header}</h2>
      <p>{description}</p>
    </div>
  );
}