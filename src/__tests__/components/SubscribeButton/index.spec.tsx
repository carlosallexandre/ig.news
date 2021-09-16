import { render, screen, fireEvent } from '@testing-library/react'
import { mocked } from 'ts-jest/utils'
import { signIn, useSession } from 'next-auth/client'
import { useRouter } from 'next/router'

import { SubscribeButton } from '../../../components/SubscribeButton'

jest.mock('next-auth/client')

jest.mock('next/router')

describe('SubscribeButton component', () => {
  it('should be render correctly', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce([null, false])

    render(<SubscribeButton />)
    
    expect(screen.getByText('Subscribe now')).toBeInTheDocument()
  })

  it('should redirect user to sign in when not authenticated', () => {
    const signInMocked = mocked(signIn)
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce([null, false])
    
    render(<SubscribeButton />)  

    const subscribeButton = screen.getByText('Subscribe now')

    fireEvent.click(subscribeButton)

    expect(signInMocked).toHaveBeenCalled()
  })

  it('should redirect to posts when user already has a subscription', () => {
    const useSessionMocked = mocked(useSession)
    const useRouterMocked = mocked(useRouter)
    const pushMocked = jest.fn()

    useSessionMocked.mockReturnValueOnce([
      {
        user: { name: 'John Doe', email: 'johndoe@example.com' },
        expires: 'fake-expires',
        activeSubscription: 'fake-subscription'
      },
      false
    ])

    useRouterMocked.mockReturnValueOnce({
      push: pushMocked
    } as any)

    render(<SubscribeButton />)

    const subscribeButton = screen.getByText('Subscribe now')

    fireEvent.click(subscribeButton)

    expect(pushMocked).toHaveBeenCalledWith('/posts')
  })
})