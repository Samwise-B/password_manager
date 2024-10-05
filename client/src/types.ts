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
    updatePassList: ({ id, site_favicon, username, email, password, url, salt, iv }: PasswordListItem) => void,
}

export interface IEditButtonProps {
    isEditing: boolean;
    toggleEditPassword: () => void;
    updatePassword: () => void;
}

export type PasswordItem = {
    newPassword: PasswordListItem | undefined
}