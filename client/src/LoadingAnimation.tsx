import { Spinner } from "react-bootstrap"

export function LoadingAnimation() {
    return (
      <div className='container-fluid'>
        <Spinner animation='border' variant='light'/>
      </div>
    )
  }