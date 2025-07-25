// Utility function to check if INFO=Show is present in the session
export function isInfoEnabled(): boolean {
  return sessionStorage.getItem('Console.info') === 'true';
}

// Replace console.info with a conditional check
const originalConsoleInfo = console.info;
console.info = function (...args: any[]) {
  if (isInfoEnabled()) {
    originalConsoleInfo.apply(console, args);
  }
};