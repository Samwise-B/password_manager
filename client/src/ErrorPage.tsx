interface IErrorPage {
    errorCode: string, 
    errorMessageShort: string, 
    errorMessageFull: string
}

export function ErrorPage({errorCode, errorMessageShort, errorMessageFull}: IErrorPage) {
    return (
        <div className="container text-center">
            <h1 className="display-1 text-danger">{errorCode}</h1>
            <h2 className="display-4">{errorMessageShort}</h2>
            <p className="lead">
                {errorMessageFull}
            </p>
        </div>
    );
};