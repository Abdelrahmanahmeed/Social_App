import { useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ClipLoader } from 'react-spinners'
import { GoArrowLeft } from 'react-icons/go'
import { AuthContext } from '../../Context/AuthContext.jsx'
import PostCard from '../PostCard/PostCard.jsx'

export default function PostDetails() {
  const { id } = useParams()
  const { token } = useContext(AuthContext)

  async function getPostDetails() {
    const { data } = await axios.get(`https://route-posts.routemisr.com/posts/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return data
  }

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ['postDetails', id],
    queryFn: getPostDetails,
    enabled: !!token && !!id,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <ClipLoader color="#00298d" size={45} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto mt-10 max-w-2xl px-4 text-center">
        <p className="text-sm text-red-500">
          {error?.response?.data?.message || error?.message || 'Failed to load post'}
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#1877f2] shadow-sm"
        >
          <GoArrowLeft />
          Back to feed
        </Link>
      </div>
    )
  }

  const post = data?.data?.post

  if (!post) {
    return (
      <div className="mx-auto mt-10 max-w-2xl px-4 text-center">
        <p className="text-sm text-slate-500">Post not found</p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#1877f2] shadow-sm"
        >
          <GoArrowLeft />
          Back to feed
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <GoArrowLeft size={18} />
          Back to feed
        </Link>

        <PostCard
          post={post}
          queryKey={['postDetails', id]}
          defaultShowComments
          showViewDetails={false}
        />
      </div>
    </div>
  )
}
