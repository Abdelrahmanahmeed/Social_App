import { Link } from 'react-router-dom'
import { useContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { AiFillLike, AiOutlineLike } from 'react-icons/ai'
import { GoShareAndroid } from 'react-icons/go'
import {
  FaRegComment,
  FaBookmark,
  FaRegBookmark,
  FaEllipsisH,
} from 'react-icons/fa'
import { MdOutlineDeleteOutline, MdOutlineEdit } from 'react-icons/md'
import EditPost from '../EditPost/EditPost.jsx'
import Comments from '../Comments/Comments.jsx'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { AuthContext } from '../../Context/AuthContext.jsx'
import { showToast } from '../../utils/showToast.js'

function formatPostTime(dateString) {
  if (!dateString) return ''

  const now = new Date()
  const postDate = new Date(dateString)
  const diffMs = now - postDate
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

  return postDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export default function PostCard({
  post,
  queryKey = ['posts'],
  defaultShowComments = false,
  showViewDetails = true,
}) {
  const {
    _id,
    id,
    body,
    image,
    user = {},
    likes = [],
    likesCount,
    commentsCount,
    sharesCount,
    sharedPost,
    createdAt,
    bookmarked,
  } = post

  const postId = _id || id
  const { username, photo, name } = user
  const displayName = username || name || 'Unknown user'

  const { token, userData } = useContext(AuthContext)
  const currentUserId = userData?._id
  const isLiked = likes?.includes(currentUserId)
  const isOwner = user?._id === currentUserId

  const queryClient = useQueryClient()
  const menuRef = useRef(null)
  const shareCaptionRef = useRef(null)
  const [openLikes, setOpenLikes] = useState(false)
  const [openShare, setOpenShare] = useState(false)
  const [showComments, setShowComments] = useState(defaultShowComments)
  const [isEditing, setIsEditing] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  async function getPostLikes() {
    const { data } = await axios.get(
      `https://route-posts.routemisr.com/posts/${postId}/likes`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    return data.data.likes
  }

  const { data: likesUsers = [], isLoading: likesLoading } = useQuery({
    queryKey: ['postLikes', postId],
    queryFn: getPostLikes,
    enabled: openLikes && !!token && likesCount > 0,
  })

  function handleDeletePost() {
    return axios.delete(`https://route-posts.routemisr.com/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: handleDeletePost,
    onSuccess: () => {
      showToast('Post deleted successfully')
      queryClient.invalidateQueries({ queryKey })
    },
    onError: () => {
      showToast('Failed to delete post', 'error')
    },
  })

  function handleLikeUnlikePost() {
    return axios.put(
      `https://route-posts.routemisr.com/posts/${postId}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
  }

  const { mutate: likeUnlikePost, isPending: isLiking } = useMutation({
    mutationFn: handleLikeUnlikePost,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (oldPosts) => {
        if (!Array.isArray(oldPosts)) return oldPosts

        return oldPosts.map((item) => {
          const itemId = item._id || item.id
          if (itemId !== postId) return item

          const likesArray = item.likes || []
          const alreadyLiked = likesArray.includes(currentUserId)

          return {
            ...item,
            likes: alreadyLiked
              ? likesArray.filter((likeId) => likeId !== currentUserId)
              : [...likesArray, currentUserId],
            likesCount: alreadyLiked
              ? Math.max((item.likesCount || 1) - 1, 0)
              : (item.likesCount || 0) + 1,
          }
        })
      })

      return { previousData }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: ['postLikes', postId] })
    },
  })

  async function handleBookmarkPost(wasBookmarked) {
    await axios.put(
      `https://route-posts.routemisr.com/posts/${postId}/bookmark`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    return wasBookmarked
  }

  const { mutate: bookmarkPost, isPending: isBookmarking } = useMutation({
    mutationFn: handleBookmarkPost,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (oldPosts) => {
        if (!Array.isArray(oldPosts)) return oldPosts

        return oldPosts.map((item) => {
          const itemId = item._id || item.id
          if (itemId !== postId) return item

          return {
            ...item,
            bookmarked: !item.bookmarked,
          }
        })
      })

      return { previousData }
    },
    onSuccess: (_data, wasBookmarked) => {
      showToast(
        wasBookmarked ? 'Post removed from saved' : 'Post saved successfully',
      )
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      showToast('Failed to save post', 'error')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: ['savedPosts'] })
    },
  })

  function handleSharePost() {
    return axios.post(
      `https://route-posts.routemisr.com/posts/${postId}/share`,
      { body: shareCaptionRef.current?.value?.trim() || ' ' },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
  }

  const { mutate: sharePost, isPending: isSharing } = useMutation({
    mutationFn: handleSharePost,
    onSuccess: () => {
      if (shareCaptionRef.current) {
        shareCaptionRef.current.value = ''
      }
      setOpenShare(false)
      showToast('Post shared successfully')
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: ['savedPosts'] })
      queryClient.invalidateQueries({ queryKey: ['myPosts'] })
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] })
    },
    onError: () => {
      showToast('Failed to share post', 'error')
    },
  })

  function handleSaveClick() {
    setMenuOpen(false)
    bookmarkPost(bookmarked)
  }

  function handleEditClick() {
    setMenuOpen(false)
    setIsEditing(true)
  }

  function handleDeleteClick() {
    setMenuOpen(false)
    deletePost()
  }

  if (isEditing) {
    return (
      <EditPost post={post} queryKey={queryKey} setIsEditing={setIsEditing} />
    )
  }

  return (
    <article
      className={`relative overflow-visible rounded-xl border border-[#E2E8F0] bg-white shadow-sm ${
        menuOpen ? 'z-40' : ''
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {photo ? (
              <img
                src={photo}
                alt={displayName}
                className="h-11 w-11 rounded-full border border-[#E2E8F0] object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00298d] text-sm font-semibold text-white">
                {getInitials(displayName)}
              </div>
            )}

            <div>
              <p className="font-semibold text-[#0f172a]">{displayName}</p>
              {createdAt && (
                <p className="text-xs text-[#64748b]">{formatPostTime(createdAt)}</p>
              )}
            </div>
          </div>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Post options"
            >
              <FaEllipsisH size={18} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 min-w-[200px] rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                <button
                  type="button"
                  onClick={handleSaveClick}
                  disabled={isBookmarking}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  {bookmarked ? (
                    <FaBookmark size={16} className="shrink-0 text-[#1877f2]" />
                  ) : (
                    <FaRegBookmark size={16} className="shrink-0 text-slate-500" />
                  )}
                  {bookmarked ? 'Unsave post' : 'Save post'}
                </button>

                {isOwner && (
                  <>
                    <button
                      type="button"
                      onClick={handleEditClick}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <MdOutlineEdit size={16} className="shrink-0 text-slate-500" />
                      Edit post
                    </button>

                    <div className="my-1 border-t border-slate-200" />

                    <button
                      type="button"
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      <MdOutlineDeleteOutline size={18} className="shrink-0 text-red-600" />
                      Delete post
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {bookmarked && (
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#E7F3FF] px-2.5 py-1 text-xs font-bold text-[#1877f2]">
            <FaBookmark size={12} />
            Saved
          </div>
        )}

        {body && (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#334155]">
            {body}
          </p>
        )}

        {sharedPost && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center gap-2">
              {sharedPost.user?.photo ? (
                <img
                  src={sharedPost.user.photo}
                  alt={sharedPost.user?.name || 'User'}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00298d] text-xs font-semibold text-white">
                  {getInitials(sharedPost.user?.name || sharedPost.user?.username || '')}
                </div>
              )}
              <p className="text-sm font-semibold text-slate-900">
                {sharedPost.user?.name || sharedPost.user?.username || 'User'}
              </p>
            </div>

            {sharedPost.body && (
              <p className="text-sm text-slate-700">{sharedPost.body}</p>
            )}

            {sharedPost.image && (
              <div className="mt-2 overflow-hidden rounded-lg bg-[#F0F2F5]">
                <img
                  src={sharedPost.image}
                  alt="Shared post"
                  className="mx-auto max-h-64 w-full object-contain"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {image && (
        <div className="overflow-hidden border-t border-[#E2E8F0] bg-[#F0F2F5]">
          <img
            src={image}
            alt="Post"
            className="mx-auto max-h-[min(480px,65vh)] w-full object-contain"
          />
        </div>
      )}

      <div className="px-4 pb-1 pt-2">
        {(likesCount > 0 || commentsCount > 0 || sharesCount > 0 || showViewDetails) && (
          <div className="flex items-center justify-between pb-2 text-[13px] text-[#65676B]">
            <button
              type="button"
              onClick={() => likesCount > 0 && setOpenLikes(true)}
              className={`flex items-center gap-1.5 ${
                likesCount > 0
                  ? 'cursor-pointer hover:underline'
                  : 'cursor-default'
              }`}
            >
              {likesCount > 0 && (
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#1877F2]">
                  <AiFillLike size={11} className="text-white" />
                </span>
              )}
              {likesCount > 0 && <span>{likesCount}</span>}
            </button>

            <div className="flex items-center gap-3">
              {commentsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowComments(true)}
                  className="cursor-pointer hover:underline"
                >
                  {commentsCount} comments
                </button>
              )}
              {sharesCount > 0 && (
                <span className="cursor-pointer hover:underline">
                  {sharesCount} shares
                </span>
              )}
              {showViewDetails && (
                <Link
                  to={`/postdetails/${postId}`}
                  className="rounded-md px-3 py-1.5 text-[12px] font-bold text-[#1877f2] transition hover:bg-[#E7F3FF]"
                >
                  View Details
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-[#CED0D4]" />

        <div className="flex items-center pt-1">
          <button
            type="button"
            onClick={() => likeUnlikePost()}
            disabled={isLiking}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-[15px] font-semibold transition disabled:opacity-60 ${
              isLiked
                ? 'text-[#1877F2] hover:bg-[#E7F3FF]'
                : 'text-[#65676B] hover:bg-[#F2F3F5]'
            }`}
          >
            {isLiked ? <AiFillLike size={20} /> : <AiOutlineLike size={20} />}
            Like
          </button>

          <button
            type="button"
            onClick={() => setShowComments((prev) => !prev)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-[15px] font-semibold transition ${
              showComments
                ? 'text-[#1877F2] hover:bg-[#E7F3FF]'
                : 'text-[#65676B] hover:bg-[#F2F3F5]'
            }`}
          >
            <FaRegComment size={18} />
            Comment
          </button>

          <button
            type="button"
            onClick={() => setOpenShare(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-[15px] font-semibold text-[#65676B] transition hover:bg-[#F2F3F5]"
          >
            <GoShareAndroid size={20} />
            Share
          </button>
        </div>
      </div>

      {showComments && (
        <div className="border-t border-[#CED0D4] px-2 pb-3">
          <Comments postId={postId} postsQueryKey={queryKey} />
        </div>
      )}

      {openShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Share post</h2>
              <button
                type="button"
                onClick={() => setOpenShare(false)}
                className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <textarea
              ref={shareCaptionRef}
              rows={3}
              placeholder="Say something about this..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#1877f2] focus:bg-white"
            />

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                {photo ? (
                  <img
                    src={photo}
                    alt={displayName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00298d] text-xs font-semibold text-white">
                    {getInitials(displayName)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-slate-900">{displayName}</p>
                  {username && (
                    <p className="text-xs text-slate-500">@{username}</p>
                  )}
                </div>
              </div>

              {body && <p className="mt-2 text-sm text-slate-700">{body}</p>}

              {image && (
                <div className="mt-3 overflow-hidden rounded-lg bg-white">
                  <img
                    src={image}
                    alt="Post preview"
                    className="mx-auto max-h-48 w-full object-contain"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpenShare(false)}
                disabled={isSharing}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => sharePost()}
                disabled={isSharing}
                className="rounded-lg bg-[#1877f2] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#166fe5] disabled:opacity-60"
              >
                {isSharing ? 'Sharing...' : 'Share now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {openLikes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[70vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">People who liked</h2>
              <button
                type="button"
                onClick={() => setOpenLikes(false)}
                className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {likesLoading && (
              <p className="py-4 text-center text-sm text-slate-500">Loading...</p>
            )}

            {!likesLoading && likesUsers.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">No likes yet</p>
            )}

            {!likesLoading &&
              likesUsers.map((likeUser) => (
                <div
                  key={likeUser._id}
                  className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0"
                >
                  <img
                    src={
                      likeUser.photo ||
                      'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'
                    }
                    alt={likeUser.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{likeUser.name}</p>
                    <p className="text-sm text-slate-500">@{likeUser.username}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </article>
  )
}
