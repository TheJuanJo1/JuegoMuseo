export const API_URL = process.env.REACT_APP_BACKEND_URL;
//export const API_URL = "http://localhost:3000"

if (!API_URL) {
    console.error("ERROR: REACT_APP_BACKEND_URL no está definida")
}
