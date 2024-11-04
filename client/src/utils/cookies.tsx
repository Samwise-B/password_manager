
export async function cryptoKeyToCookieString(key: CryptoKey) {
    const exportedKey = await crypto.subtle.exportKey("jwk", key);
    return btoa(JSON.stringify(exportedKey));  // Convert JWK to base64 string
  }

// function setCookie(name:string, value:string, days:number) {
//     let expires = "";
//     if (days) {
//       const date = new Date();
//       date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
//       expires = "; expires=" + date.toUTCString();
//     }
//     document.cookie = name + "=" + value + expires + "; path=/; Secure; SameSite=Strict";
//   }
  
//   async function saveCryptoKeyToCookie(key: CryptoKey) {
//     const base64Key = await cryptoKeyToCookieString(key);
//     setCookie("cryptoKey", base64Key, 7);  // Save cookie for 7 days
//   }