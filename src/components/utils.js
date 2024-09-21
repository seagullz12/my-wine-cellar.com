
export const getTokenFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token'); // Adjust this if your token is stored differently
  };
  
  export const getWineIdFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode base64
      return payload.wineId; // Adjust this according to your token structure
    } catch (error) {
      console.error('Error decoding token:', error);
      return null; // Return null if there's an error
    }
  };
  