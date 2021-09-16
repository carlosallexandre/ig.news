import  { render, screen } from '@testing-library/react'
import { mocked } from 'ts-jest/utils'
import { getPrismicClient } from '../../../services/prismic'
import { getSession } from 'next-auth/client'
import Post, { getServerSideProps } from '../../../pages/posts/[slug]'

jest.mock('next-auth/client')
jest.mock('../../../services/prismic')

const post = { 
  slug: 'new-post', 
  title: 'New post', 
  content: '<p>New fake post</p>', 
  updatedAt: 'March, 10'
}


describe('Post page', () => {
  it('should render correctly', () => {
    render(<Post post={post} />)

    expect(screen.getByText('New post')).toBeInTheDocument()
    expect(screen.getByText('New fake post')).toBeInTheDocument()
  })

  it('should redirect user without subscription', async () => {
    const SLUG = 'fake-post'    
    
    const getSessionMocked = mocked(getSession)
    getSessionMocked.mockResolvedValueOnce(null)

    const response = await getServerSideProps({
      params: {
        slug: SLUG
      }
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: `/posts/preview/${SLUG}`
        })
      })
    )
  })

  it('should load initial data', async () => {
    const SLUG = 'fake-post'    
    
    const getSessionMocked = mocked(getSession)
    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-subscription'
    })

    const prismicMocked = mocked(getPrismicClient)

    prismicMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            { type: 'heading', text: 'New Post' }
          ],
          content: [
            { type: 'paragraph', text: 'excerpt'}
          ],
        },
        last_publication_date: '09-16-2021',
      })
    } as any)

    const response = await getServerSideProps({
      params: {
        slug: SLUG
      }
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: SLUG,
            title: 'New Post',
            content: '<p>excerpt</p>',
            updatedAt: '16 de setembro de 2021'
          }
        }
      })
    )
  })
})