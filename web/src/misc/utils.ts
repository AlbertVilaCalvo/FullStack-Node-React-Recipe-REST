export const isDev: boolean = import.meta.env.MODE === 'development'
console.log(`import.meta.env.MODE:`, import.meta.env.MODE)
console.log(`import.meta.env.DEV:`, import.meta.env.DEV)
console.log(`import.meta.env.PROD:`, import.meta.env.PROD)
console.log(`import.meta.env.VITE_PORT:`, import.meta.env.VITE_PORT)
console.log(
  `import.meta.env.VITE_API_BASE_URL:`,
  import.meta.env.VITE_API_BASE_URL
)
