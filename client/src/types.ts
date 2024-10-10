export type PasswordListItem = {
    id: number;
    site_favicon: string;
    username: string;
    email: string;
    url: string;
    password: string;
    salt: string;
    iv: string;
}

export type EncryptedData = {
    iv: Uint8Array,
    ciphertext: Uint8Array
}

export interface passDetailProps {
    passList: Array<PasswordListItem>,
    currentIndex: number,
    updatePassList: ({ id, site_favicon, username, email, password, url, salt, iv }: PasswordListItem, operation: string) => void,
    handleClose: () => void,
    handleError: (errorCode: string, errorMessageShort:string, errorMessageFull:string) => void
}

export interface IEditButtonProps {
    isEditing: boolean;
    toggleEditPassword: () => void;
    updatePassword: () => void;
}

export type PasswordItem = {
    newPassword: PasswordListItem | undefined
}

export interface passBankProps {
    passwordList: Array<PasswordListItem>,
    filterString: string,
    onPassItemClick: (index: number) => void,
    setPassList: (passList: Array<PasswordListItem>) => void,
}

export interface passBankItemProps {
    key: number,
    index: number,
    passItem: PasswordListItem,
    onPassItemClick: (index: number) => void,
}

export interface EmptyPassListProps {
    header: string,
    description: string,
}