export type PasswordListItem = {
    site_favicon: string;
    username: string;
    email: string;
    password: string;
    url: string;
}

export type EncryptedData = {
    iv: Uint8Array,
    ciphertext: Uint8Array
}

export interface passDetailProps {
    passList: Array<PasswordListItem>,
    currentIndex: number
}

export interface IEditButtonProps {
    isEditing: boolean;
    handleEditPassword: () => void;
    updatePassword: () => void;
}

export type PasswordItem = {
    newPassword: PasswordListItem | undefined
}