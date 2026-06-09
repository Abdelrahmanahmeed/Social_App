import { useContext, useState } from 'react'
import { GoCheck } from 'react-icons/go'
import { FaRegComment } from 'react-icons/fa'
import { CiHeart } from 'react-icons/ci'
import { BiRepost } from 'react-icons/bi'
import { CgUserAdd } from 'react-icons/cg'
import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthContext } from '../../Context/AuthContext.jsx'

const DEFAULT_PHOTO =
  'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'

const TYPE_LABELS = {
  like_post: 'liked your post',
  comment_post: 'commented on your post',
  share_post: 'shared your post',
  follow_user: 'started following you',
}

function getTypeLabel(type) {
  return TYPE_LABELS[type] || type?.replace(/_/g, ' ') || 'sent you a notification'
}

export default function NotificationsCard({ notification, queryKey }) {
  const { isRead, actor = {}, _id, type } = notification
  const { name, photo } = actor
  const { token } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const [markedLocally, setMarkedLocally] = useState(false)

  const isMarkedRead = isRead || markedLocally

  function markNotificationAsRead() {
    return axios.patch(
      `https://route-posts.routemisr.com/notifications/${_id}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
  }

  const { mutate, isPending } = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      setMarkedLocally(true)
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] })
    },
  })

  return (
    <div
      className={`rounded-xl border p-3 transition ${
        isMarkedRead
          ? 'border-slate-200 bg-white'
          : 'border-[#dbeafe] bg-[#eef6ff]'
      }`}
    >
      <div className="flex items-center gap-3">
        <img
          src={photo || DEFAULT_PHOTO}
          alt={name || 'User'}
          className="h-10 w-10 rounded-full object-cover"
        />

        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-800">
            <span className="font-bold">{name || 'Someone'}</span>{' '}
            <span className="text-slate-600">{getTypeLabel(type)}</span>
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {type === 'comment_post' && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
            <FaRegComment size={15} className="text-[#1877f2]" />
          </div>
        )}
        {type === 'like_post' && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
            <CiHeart size={18} className="text-[#FF2056]" />
          </div>
        )}
        {type === 'share_post' && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
            <BiRepost size={18} className="text-green-600" />
          </div>
        )}
        {type === 'follow_user' && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
            <CgUserAdd size={18} className="text-[#7F22FE]" />
          </div>
        )}

        {!isMarkedRead && (
          <button
            type="button"
            onClick={() => mutate()}
            disabled={isPending}
            className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-bold text-[#1877f2] transition hover:bg-[#E7F3FF] disabled:opacity-60"
          >
            <GoCheck size={14} />
            {isPending ? 'Saving...' : 'Mark as read'}
          </button>
        )}

        {isMarkedRead && (
          <span className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-bold text-emerald-600">
            <GoCheck size={14} />
            Read
          </span>
        )}
      </div>
    </div>
  )
}
