import { formatUserFacingError } from '../store/thunkUtils'

type ErrorAlertProps = {
  message: string
  title?: string
  variant?: 'inline' | 'page'
  className?: string
}

export default function ErrorAlert({
  message,
  title,
  variant = 'inline',
  className = '',
}: ErrorAlertProps) {
  const text = formatUserFacingError(message)
  const classes = [
    'mis-alert',
    'mis-alert--error',
    variant === 'page' ? 'mis-alert--page' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div role="alert" className={classes}>
      {title ? (
        <>
          <strong>{title}</strong> {text}
        </>
      ) : (
        text
      )}
    </div>
  )
}
