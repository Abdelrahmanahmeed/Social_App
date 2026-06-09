import { useContext, useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ClipLoader } from 'react-spinners'
import { AuthContext } from '../../Context/AuthContext.jsx'
import NotificationsCard from '../NotificationsCard/NotificationsCard.jsx'

export default function Notification() {
  const { token } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('all')

  const notificationsQueryKey = ['notifications', token]
  const unreadQueryKey = ['unreadNotifications', token]

  async function getAllNotifications() {
    const { data } = await axios.get(
      'https://route-posts.routemisr.com/notifications',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    return data
  }

  async function getUnreadCount() {
    const { data } = await axios.get(
      'https://route-posts.routemisr.com/notifications/unread-count',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    return data
  }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: getAllNotifications,
    enabled: !!token,
  })

  const { data: unreadData } = useQuery({
    queryKey: unreadQueryKey,
    queryFn: getUnreadCount,
    enabled: !!token,
  })

  function markAllAsRead() {
    return axios.patch(
      'https://route-posts.routemisr.com/notifications/read-all',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
  }

  const { mutate: markAllRead, isPending: isMarkingAll } = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
      queryClient.invalidateQueries({ queryKey: unreadQueryKey })
    },
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F8FAFC]">
        <div className="flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-lg">
          <ClipLoader color="#1877f2" size={28} />
          <p className="text-[15px] font-medium text-slate-700">
            Loading notifications...
          </p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F8FAFC] px-4">
        <p className="text-sm text-red-500">
          {error?.response?.data?.message || 'Failed to load notifications'}
        </p>
      </div>
    )
  }

  const allNotifications = data?.data?.notifications || []
  const unreadCount = unreadData?.data?.count ?? 0
  const shownNotifications =
    filter === 'unread'
      ? allNotifications.filter((item) => !item.isRead)
      : allNotifications

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0f172a] sm:text-3xl">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-[#64748b]">
              Updates for likes, comments, shares, and follows.
            </p>
          </div>

          {allNotifications.length > 0 && unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              disabled={isMarkingAll}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {isMarkingAll ? 'Updating...' : 'Mark all as read'}
            </button>
          )}
        </div>

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-full px-3 py-1.5 text-sm font-bold transition ${
              filter === 'all'
                ? 'bg-[#1877f2] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold transition ${
              filter === 'unread'
                ? 'bg-[#1877f2] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Unread
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                filter === 'unread' ? 'bg-white/20 text-white' : 'bg-white text-[#1877f2]'
              }`}
            >
              {unreadCount}
            </span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {shownNotifications.length > 0 ? (
            shownNotifications.map((notifi) => (
              <NotificationsCard
                key={notifi._id}
                notification={notifi}
                queryKey={notificationsQueryKey}
              />
            ))
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-sm font-semibold text-slate-700">
                {filter === 'unread'
                  ? 'No unread notifications'
                  : 'No notifications yet'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {filter === 'unread'
                  ? 'You are all caught up.'
                  : 'Activity from likes, comments, and follows will show up here.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
