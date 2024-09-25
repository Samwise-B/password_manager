export interface IGeneratePassword {
    passLength: number,
    hasLetters: boolean,
    hasDigits: boolean,
    hasSymbols: boolean
}

export function generatePassword({passLength, hasLetters, hasDigits, hasSymbols}: IGeneratePassword): string {
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digits = "0123456789";
    const symbols = ";@#!?~";
    let pass = "";
    let chars = "";
    if (hasLetters) {
      chars += letters;
    }
    if (hasDigits) {
      chars += digits;
    }
    if (hasSymbols) {
      chars += symbols;
    }

    if (chars == "") {
      return pass;
    }
    else {
      const num_chars = chars.length;
      const pass_ints = new Uint32Array(passLength);
      const pass_buff = window.crypto.getRandomValues(pass_ints);
      pass_buff.forEach((i) => {
        pass += chars[i % num_chars];
      });
      return pass;
    }
  }