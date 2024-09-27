import {passDetailProps, IEditButtonProps, PasswordListItem} from './types';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useState } from 'react';

export function PassDetails({passList, currentIndex} : passDetailProps) {
    const [passInputType, setPassInputType] = useState<string>("password");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [passItem, setPassItem] = useState<PasswordListItem>(passList[currentIndex]);
    //const passItem = passList[currentIndex];
    //console.log(passItem);
  
    function handleShowPassword() {
      if (passInputType == "password") {
        setPassInputType("text");
      } else {
        setPassInputType("password");
      }
    }
  
    function handleEditPassword() {
      setIsEditing(true);
      handleShowPassword();
    }
  
    function updatePassword() {
      // TODO update passList
      setIsEditing(false);
    }
  
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const {id, value} = e.target;
      setPassItem((prevItem) => ({
        ...prevItem,
        [id]:value
      }));
      console.log(passItem)
    }
  
    return (
      <>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className='container d-flex justify-content-center'>Password Details</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="container">
            <div className="container mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input type="email" className="form-control" id="email" 
                value={passItem.email} 
                readOnly={!isEditing} 
                onChange={handleChange}></input>
            </div>
            <div className="container mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input type="text" className="form-control" id="username" 
              value={passItem.username} 
              readOnly={!isEditing} 
              onChange={handleChange}></input>
            </div>
            <label htmlFor="password" className="form-label">Password</label>
            <div className="container input-group mb-3">
              <input type={passInputType} id="password" className="form-control" aria-describedby="passwordHelpBlock" 
              value={passItem.password}  
              readOnly={!isEditing}
              onChange={handleChange}></input>
              <button type="button" className="btn btn-primary" onClick={handleShowPassword}>Show</button>
            </div>
            <div className="container mb-3">
              <label htmlFor="url" className="form-label">Website</label>
              <input type="url" className="form-control" id="url" 
              value={passItem.url} 
              readOnly={!isEditing}
              onChange={handleChange}></input>
            </div>
            <div className='container d-flex justify-content-center'>
              <EditButton isEditing={isEditing} handleEditPassword={handleEditPassword} updatePassword={updatePassword}/>
              <button type="button" className="btn btn-primary mx-3">Delete</button>
            </div>
          </div>
        </Offcanvas.Body>
      </>
    )
}

export function EditButton({isEditing, handleEditPassword, updatePassword}: IEditButtonProps) {
    if (!isEditing) {
        return <button type="button" className="btn btn-primary mx-3" onClick={handleEditPassword}>Edit</button>;
    } else {
        return <button type="button" className="btn btn-primary mx-3" onClick={updatePassword}>Done</button>;
    }
}