import path from 'path'
import fs from 'fs/promises'
import parseFrontMatter from 'front-matter'
import invariant from 'tiny-invariant'
import { marked } from 'marked'

export type PostMarkdownAttributes = {
  title: string
}

export type Post = {
  title: string
  slug: string
  markdown: string
}

export type ParsedPost = Pick<Post, 'title' | 'slug'> & {
  html: string
}

// relative to the server output not the source!
let postsPath = path.join(__dirname, '../..', 'posts')

function isValidPostAttributes(
  attributes: any
): attributes is PostMarkdownAttributes {
  return attributes?.title
}

export async function getPosts() {
  let dir = await fs.readdir(postsPath)
  return Promise.all(
    dir.map(async (filename) => {
      let file = await fs.readFile(path.join(postsPath, filename))
      let { attributes } = parseFrontMatter(file.toString())
      invariant(
        isValidPostAttributes(attributes),
        `${filename} has bad meta data!`
      )
      return {
        slug: filename.replace(/\.md$/, ''),
        title: attributes.title,
      }
    })
  )
}

export async function getPost(slug: string): Promise<ParsedPost> {
  let filepath = path.join(postsPath, slug + '.md')
  let file = await fs.readFile(filepath)
  let { attributes, body } = parseFrontMatter(file.toString())
  invariant(
    isValidPostAttributes(attributes),
    `Post ${filepath} is missing attributes`
  )
  let html = marked(body)
  return { slug, html, title: attributes.title }
}

export async function getRawPost(slug: string): Promise<Post> {
  let filepath = path.join(postsPath, slug + '.md')
  let file = await fs.readFile(filepath)
  let { attributes, body } = parseFrontMatter(file.toString())
  invariant(
    isValidPostAttributes(attributes),
    `Post ${filepath} is missing attributes`
  )
  return { slug, markdown: body, title: attributes.title }
}

export async function createPost(post: Post) {
  let md = `---\ntitle: ${post.title}\n---\n\n${post.markdown}`
  await fs.writeFile(path.join(postsPath, post.slug + '.md'), md)
  return getPost(post.slug)
}

export async function updatePost(post: Post & { oldSlug: string }) {
  //if the slug has changed, delete the old one
  if (post.slug !== post.oldSlug) {
    await fs.unlink(path.join(postsPath, post.oldSlug + '.md'))
  }
  let md = `---\ntitle: ${post.title}\n---\n\n${post.markdown}`
  await fs.writeFile(path.join(postsPath, post.slug + '.md'), md)
  return getPost(post.slug)
}
