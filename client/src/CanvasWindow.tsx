import { PassDetails } from "./PassDetails";
import { PasswordCreator } from "./PasswordCreator";
import { Offcanvas } from "react-bootstrap";
import { OffCanvasProps } from "./types";

export function OffCanvasWindow({ canvasContent, passList, currentIndex, UpdatePassList, AddToPassList, show, setShow, handleError }: OffCanvasProps) {
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