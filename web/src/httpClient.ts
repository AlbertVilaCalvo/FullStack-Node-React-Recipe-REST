import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:5000/api'
axios.defaults.timeout = 10000

export const httpClient = axios.create()
