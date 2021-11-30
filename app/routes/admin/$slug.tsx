import {
  Form,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
  useTransition,
} from 'remix'
import invariant from 'tiny-invariant'
import type { ActionFunction } from 'remix'
import { createPost, getRawPost, Post, updatePost } from '~/post'

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, 'expected params.slug')
  return getRawPost(params.slug)
}

export let action: ActionFunction = async ({ request }) => {
  await new Promise((res) => setTimeout(res, 1000))
  let formData = await request.formData()

  let title = formData.get('title')
  let slug = formData.get('slug')
  let markdown = formData.get('markdown')
  let oldSlug = formData.get('oldSlug')

  let errors: { [k in keyof Post]?: boolean } = {}
  if (!title) errors.title = true
  if (!slug) errors.slug = true
  if (!markdown) errors.markdown = true

  if (Object.keys(errors).length) {
    return errors
  }
  invariant(typeof oldSlug === 'string')
  invariant(typeof title === 'string')
  invariant(typeof slug === 'string')
  invariant(typeof markdown === 'string')
  await updatePost({ oldSlug, title, slug, markdown })

  return redirect('/admin')
}

export default function EditPost() {
  let post = useLoaderData<Post>()
  let errors = useActionData()
  let transition = useTransition()
  return (
    <Form method="post">
      <input type="hidden" name="oldSlug" value={post.slug} />
      <p>
        <label>
          Post Title: {errors?.title && <em>Title is required</em>}
          <input type="text" name="title" defaultValue={post.title} />
        </label>
      </p>
      <p>
        <label>
          Post Slug: {errors?.slug && <em>Slug is required</em>}
          <input type="text" name="slug" defaultValue={post.slug} />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown:</label>{' '}
        {errors?.markdown && <em>Markdown is required</em>}
        <br />
        <textarea
          rows={20}
          name="markdown"
          id="markdown"
          defaultValue={post.markdown}
        />
      </p>
      <p>
        <button type="submit">
          {transition.submission ? 'Creating...' : 'Create Post'}
        </button>
      </p>
    </Form>
  )
}
