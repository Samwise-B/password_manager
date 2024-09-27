export type PasswordListItem = {
    site_favicon: string;
    username: string;
    email: string;
    password: string;
    url: string;
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