export function useStyledLog(message: string, data: any = null) {
  // Skip logging in production
  if (process.env.ENVIRONMENT === 'production') {
    return
  }

  const styles = {
    prefix:
      'color: yellow; background-color: black; font-size: 14px; font-weight: bold; padding: 2px;',
    message:
      'color: limegreen; background-color: black; font-size: 14px; padding: 2px;',
    data: 'color: white; background-color: black; font-size: 14px; padding: 2px;',
  }

  console.log(
    `%cDEBUG: %c${message}`,
    styles.prefix,
    styles.message,
    data || '',
  )
}
