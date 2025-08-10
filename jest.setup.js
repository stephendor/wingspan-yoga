import '@testing-library/jest-dom'
const originalWarn = console.warn
console.warn = (...args) => {
	const first = typeof args[0] === 'string' ? args[0] : ''
	if (first.toLowerCase().startsWith('prisma:warn')) return
	originalWarn(...args)
}
