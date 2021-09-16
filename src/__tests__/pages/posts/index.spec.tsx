import  { render, screen } from '@testing-library/react'
import { mocked } from 'ts-jest/utils'
import { getPrismicClient } from '../../../services/prismic'
import Posts, { getStaticProps } from '../../../pages/posts'

jest.mock('../../../services/prismic')

const posts = [
  { slug: 'new-post', title: 'New post', excerpt: 'New fake post', updatedAt: 'March, 10'}
]

describe('Posts page', () => {
  it('should render correctly', () => {
    render(<Posts  posts={posts} />)

    expect(screen.getByText('New post')).toBeInTheDocument()
  })

  it('should load initial data', async () => {
    const prismicMocked = mocked(getPrismicClient)

    prismicMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'new-post',
            data: {
              title: [
                { type: 'heading', text: 'New Post' }
              ],
              content: [
                { type: 'paragraph', text: 'excerpt'}
              ],
            },
            last_publication_date: '09-16-2021',
          }
        ]
      })
    } as any)

    const response = await getStaticProps({})

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: 'new-post',
              title: 'New Post',
              excerpt: 'excerpt',
              updatedAt: '16 de setembro de 2021'
            }
          ]
        }
      })
    )
  })
})