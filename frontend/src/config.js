export const API_URL = process.env.REACT_APP_BACKEND_URL;

if (!API_URL) {
    console.error("ERROR: REACT_APP_BACKEND_URL no está definida")
}