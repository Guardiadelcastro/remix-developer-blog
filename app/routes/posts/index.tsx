import { useLoaderData } from 'remix'

export let loader = () => {
  return [
    {
      slug: 'my-first-post',
      title: 'My First Post',
    },
    {
      slug: '90s-mixtape',
      title: 'A Mixtape I Made Just For You',
    },
  ]
}

export default function Posts() {
  return (
    <div>
      <h1>Posts</h1>
    </div>
  )
}
