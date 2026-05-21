import { useEffect, type ReactNode } from 'react'
import { Spinner } from 'react-bootstrap'
import { restoreSessionThunk } from '../store/authSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { IS_GUEST_MODE } from '../config/env'

export default function AuthBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const sessionChecked = useAppSelector((state) => state.auth.sessionChecked)

  useEffect(() => {
    if (IS_GUEST_MODE) return
    void dispatch(restoreSessionThunk())
  }, [dispatch])

  if (IS_GUEST_MODE) {
    return <>{children}</>
  }

  if (!sessionChecked) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '40vh' }}>
        <Spinner animation="border" />
      </div>
    )
  }

  return <>{children}</>
}
