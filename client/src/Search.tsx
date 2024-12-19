import { ISearchBarProps } from "./types";

export function Search({ filterPL }: ISearchBarProps) {

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const searchString = e.target.value.toLowerCase();
      filterPL(searchString);
    }
  
    return (
      <>
        <div className='container-fluid input-group py-3 border-bottom border-secondary'>
          <input className="form-control border-secondary" type="text" id="generatedPassword" placeholder='Search' onChange={handleChange}></input>
        </div>
      </>
    )
  }