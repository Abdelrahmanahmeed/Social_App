import { useContext, useMemo, useState } from 'react'
import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LuEllipsis, LuPencil, LuTrash2, LuSendHorizontal } from 'react-icons/lu'
import { AuthContext } from '../../Context/AuthContext.jsx'

export default function CommentCard({
  comment,
  queryKey,
  postId,
  postsQueryKey = ['posts'],
}) {
  const {
    commentCreator = {},
    content,
    image,
    createdAt,
    likes = [],
    _id,
    replies = [],
    repliesCount,
  } = comment

  const { username, photo, name, _id: commentOwnerId } = commentCreator
  const { token, userData } = useContext(AuthContext)
  const currentUserId = userData?._id
  const queryClient = useQueryClient()

  const [openMenu, setOpenMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(content || '')
  const [actionError, setActionError] = useState('')
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [replyContent, setReplyContent] = useState(`@${username || ''} `)

  const isOwner = currentUserId === commentOwnerId
  const isLikedByMe = likes?.includes(currentUserId)

  const timeText = useMemo(() => {
    if (!createdAt) return ''
    return new Date(createdAt).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }, [createdAt])

  function refreshComments() {
    queryClient.invalidateQueries({ queryKey })
    queryClient.invalidateQueries({ queryKey: postsQueryKey })
  }

  const { mutate: deleteComment, isPending: isDeleting } = useMutation({
    mutationFn: () =>
      axios.delete(
        `https://route-posts.routemisr.com/posts/${postId}/comments/${_id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    onSuccess: () => {
      setActionError('')
      refreshComments()
      setOpenMenu(false)
    },
    onError: (error) => {
      setActionError(error?.response?.data?.message || 'Failed to delete comment.')
    },
  })

  const { mutate: editComment, isPending: isUpdating } = useMutation({
    mutationFn: () => {
      const formData = new FormData()
      formData.append('content', editedContent.trim())
      return axios.put(
        `https://route-posts.routemisr.com/posts/${postId}/comments/${_id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      )
    },
    onSuccess: () => {
      setActionError('')
      refreshComments()
      setIsEditing(false)
      setOpenMenu(false)
    },
    onError: (error) => {
      setActionError(error?.response?.data?.message || 'Failed to update comment.')
    },
  })

  const { mutate: likeUnlikeComment, isPending: isLiking } = useMutation({
    mutationFn: () =>
      axios.put(
        `https://route-posts.routemisr.com/posts/${postId}/comments/${_id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    onSuccess: () => {
      setActionError('')
      refreshComments()
    },
    onError: (error) => {
      setActionError(error?.response?.data?.message || 'Failed to like comment.')
    },
  })

  const { mutate: createReply, isPending: isReplying } = useMutation({
    mutationFn: () => {
      const formData = new FormData()
      formData.append('content', replyContent.trim())
      return axios.post(
        `https://route-posts.routemisr.com/posts/${postId}/comments/${_id}/replies`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      )
    },
    onSuccess: () => {
      setActionError('')
      refreshComments()
      setShowReplyBox(false)
      setReplyContent(`@${username || ''} `)
    },
    onError: (error) => {
      setActionError(error?.response?.data?.message || 'Failed to create reply.')
    },
  })

  return (
    <div className="relative w-full p-2">
      <div className="flex items-start space-x-3">
        <img
          src={
            photo ||
            'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'
          }
          alt="avatar"
          className="mt-0.5 h-10 w-10 rounded-full object-cover"
        />

        <div className="flex-1">
          <div className="relative rounded-2xl bg-[#F0F2F5] px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
                {username && (
                  <span className="text-sm text-gray-500">@{username}</span>
                )}
              </div>

              {isOwner && !isEditing && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenMenu((prev) => !prev)}
                    className="rounded-full p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                  >
                    <LuEllipsis size={16} />
                  </button>

                  {openMenu && (
                    <div className="absolute right-0 z-20 mt-1 w-32 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(true)
                          setOpenMenu(false)
                          setActionError('')
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <LuPencil size={13} />
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => deleteComment()}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                      >
                        <LuTrash2 size={13} />
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="mt-2">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#1877f2]"
                />

                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false)
                      setEditedContent(content || '')
                      setActionError('')
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating || !editedContent.trim()}
                    onClick={() => editComment()}
                    className="rounded-lg bg-[#1877f2] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#166fe5] disabled:opacity-60"
                  >
                    {isUpdating ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{content}</p>
                {image && (
                  <img src={image} className="mt-2 max-h-48 rounded-lg object-cover" alt="" />
                )}
              </>
            )}
          </div>

          <div className="mt-2 flex items-center space-x-4 pl-1 text-sm text-gray-500">
            <span>{timeText}</span>

            <button
              type="button"
              disabled={isLiking}
              onClick={() => likeUnlikeComment()}
              className={`hover:underline disabled:opacity-60 ${
                isLikedByMe ? 'font-semibold text-[#1877f2]' : ''
              }`}
            >
              {isLiking ? 'Loading...' : `Like (${likes?.length || 0})`}
            </button>

            <button
              type="button"
              onClick={() => setShowReplyBox((prev) => !prev)}
              className="hover:underline"
            >
              Reply {repliesCount ? `(${repliesCount})` : ''}
            </button>
          </div>

          {showReplyBox && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={2}
                placeholder={`Reply to @${username}`}
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1877f2]"
              />

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyBox(false)
                    setReplyContent(`@${username || ''} `)
                  }}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isReplying || !replyContent.trim()}
                  onClick={() => createReply()}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#1877f2] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#166fe5] disabled:opacity-60"
                >
                  {isReplying ? 'Sending...' : 'Reply'}
                  <LuSendHorizontal size={13} />
                </button>
              </div>
            </div>
          )}

          {replies.length > 0 && (
            <div className="mt-3 space-y-2 pl-4">
              {replies.map((reply) => (
                <div key={reply._id} className="flex items-start gap-2">
                  <img
                    src={
                      reply.commentCreator?.photo ||
                      'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'
                    }
                    alt="reply-user"
                    className="h-8 w-8 rounded-full object-cover"
                  />

                  <div className="rounded-2xl bg-[#eef2f7] px-3 py-2">
                    <p className="text-xs font-semibold text-slate-900">
                      {reply.commentCreator?.name}
                    </p>
                    {reply.commentCreator?.username && (
                      <p className="text-xs text-slate-500">
                        @{reply.commentCreator.username}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-slate-800">{reply.content}</p>
                    {reply.image && (
                      <img src={reply.image} alt="" className="mt-2 max-h-32 rounded-lg object-cover" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {actionError && (
            <p className="mt-2 pl-1 text-xs font-semibold text-rose-600">{actionError}</p>
          )}
        </div>
      </div>
    </div>
  )
}
