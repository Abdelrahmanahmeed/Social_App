import { useContext, useState } from 'react'
import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FaRegSmile, FaRegImage } from 'react-icons/fa'
import { IoMdSend } from 'react-icons/io'
import { AuthContext } from '../../Context/AuthContext.jsx'

export default function CommentCreation({ postId, queryKey, postsQueryKey = ['posts'] }) {
  const { token, userData } = useContext(AuthContext)
  const [commentValue, setCommentValue] = useState('')
  const queryClient = useQueryClient()

  function handleComment() {
    return axios.post(
      `https://route-posts.routemisr.com/posts/${postId}/comments`,
      { content: commentValue.trim() },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
  }

  const { mutate, isPending } = useMutation({
    mutationFn: handleComment,
    onSuccess: () => {
      setCommentValue('')
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: postsQueryKey })
    },
  })

  function handleSubmit() {
    if (!commentValue.trim() || isPending) return
    mutate()
  }

  return (
    <div className="mt-2 flex w-full max-w-2xl flex-col gap-2 p-2">
      <div className="flex items-start gap-3">
        <img
          src={
            userData?.photo ||
            'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'
          }
          alt="profile"
          className="h-10 w-10 rounded-full object-cover"
        />

        <div className="flex min-h-25 grow flex-col justify-between rounded-xl border border-gray-100 bg-[#F0F2F5] p-3">
          <textarea
            value={commentValue}
            onChange={(e) => setCommentValue(e.target.value)}
            placeholder="Write a comment..."
            className="w-full resize-none border-none bg-transparent text-base text-gray-700 outline-none placeholder:text-gray-400"
            rows={2}
          />

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-4 text-gray-400">
              <button type="button" className="transition hover:text-gray-600">
                <FaRegImage size={20} />
              </button>
              <button type="button" className="transition hover:text-gray-600">
                <FaRegSmile size={20} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !commentValue.trim()}
              className="rounded-full bg-[#1877F2] p-2.5 text-white shadow-md transition hover:bg-blue-600 disabled:opacity-60"
              aria-label="Send comment"
            >
              <IoMdSend size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
