import { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { FaRegComment } from 'react-icons/fa'
import { AuthContext } from '../../Context/AuthContext.jsx'
import CommentCard from '../CommentCard/CommentCard.jsx'
import CommentCreation from '../CommentCreation/CommentCreation.jsx'

export default function Comments({ postId, postsQueryKey = ['posts'] }) {
  const { token } = useContext(AuthContext)
  const commentsQueryKey = ['comments', postId]

  async function getComments() {
    const { data } = await axios.get(
      `https://route-posts.routemisr.com/posts/${postId}/comments?page=1&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    return data
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: commentsQueryKey,
    queryFn: getComments,
    enabled: !!token && !!postId,
  })

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center rounded-sm bg-[#F7F8FA] py-3">
        <p className="text-center text-[14px] font-extrabold">
          Loading Comments...
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center px-4 py-3">
        <p className="text-sm text-red-500">
          {error?.response?.data?.message || error?.message || 'Failed to load comments'}
        </p>
      </div>
    )
  }

  const allComments = data?.data?.comments || []

  return (
    <div className="w-full rounded-xl bg-[#F7F8FA] p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-extrabold tracking-wide text-slate-700">
            Comments
          </p>

          <span className="rounded-full bg-[#e7f3ff] px-2 py-0.5 text-[11px] font-bold text-[#1877f2]">
            {allComments.length}
          </span>
        </div>

        {allComments.length > 0 && (
          <select className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none ring-[#1877f2]/20 focus:border-[#1877f2] focus:bg-white focus:ring-2">
            <option value="relevant">Most relevant</option>
            <option value="newest">Newest</option>
          </select>
        )}
      </div>

      {allComments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#E7F3FF]">
            <FaRegComment size={20} color="#1877f2" />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-gray-800">
            No comments yet
          </h3>

          <p className="mt-1 text-sm text-gray-500">Be the first to comment.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allComments.map((comment) => (
            <CommentCard
              key={comment._id}
              comment={comment}
              postId={postId}
              queryKey={commentsQueryKey}
              postsQueryKey={postsQueryKey}
            />
          ))}
        </div>
      )}

      <div className="mt-3">
        <CommentCreation
          postId={postId}
          queryKey={commentsQueryKey}
          postsQueryKey={postsQueryKey}
        />
      </div>
    </div>
  )
}
