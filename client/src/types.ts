export type PasswordListItem = {
    id: number;
    username: string;
    email: string;
    url: string;
    label: string;
    password: string;
    salt: string;
    iv: string;
}

export type EncryptedData = {
    iv: Uint8Array,
    ciphertext: Uint8Array
}

export interface passwordCreatorProps {
    updatePasswordList: ({ username, email, password, url}: PasswordListItem) => void,
    handleClose: () => void,
    handleError: (errorCode: string, errorMessageShort:string, errorMessageFull:string) => void,
  }

export interface passDetailProps {
    passList: Array<PasswordListItem>,
    currentIndex: number,
    updatePassList: ({ id, username, email, password, url, salt, iv }: PasswordListItem, operation: string) => void,
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