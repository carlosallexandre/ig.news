import  { render, screen } from '@testing-library/react'
import { mocked } from 'ts-jest/utils'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/client'

import { getPrismicClient } from '../../../../services/prismic'
import Post, { getStaticProps } from '../../../../pages/posts/preview/[slug]'

jest.mock('next-auth/client')
jest.mock('next/router')
jest.mock('../../../../services/prismic')

const post = { 
  slug: 'new-post', 
  title: 'New post', 
  content: '<p>New fake post</p>', 
  updatedAt: '09-16-2021'
}

describe('Post preview page', () => {
  it('should render correctly', () => {
    const useSessionMocked = mocked(useSession)
    useSessionMocked.mockReturnValueOnce([null, false])

    render(<Post post={post} />)

    expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument()
  })

  it('should redirect user to full post when subscribed', () => {
    const pushMocked = jest.fn()
    
    const useRouterMocked = mocked(useRouter)
    useRouterMocked.mockReturnValueOnce({
      push: pushMocked
    } as any)  

    const useSessionMocked = mocked(useSession)
    useSessionMocked.mockReturnValueOnce([
      { activeSubscription: 'fake-subscription' },
      false
    ])

    render(<Post post={post} />)

    expect(pushMocked).toHaveBeenCalledWith(`/posts/${post.slug}`)
  })

  it('should load initial post', async () => {
    const prismicMocked = mocked(getPrismicClient)

    prismicMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            { type: 'heading', text: post.title }
          ],
          content: [
            { type: 'paragraph', text: 'New fake post' }
          ],
        },
        last_publication_date: post.updatedAt,
      })
    } as any)

    const response = await getStaticProps({
      params: {
        slug: post.slug
      }
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: post.slug,
            title: post.title,
            content: post.content,
            updatedAt: '16 de setembro de 2021'
          }
        }
      })
    )
  })
})