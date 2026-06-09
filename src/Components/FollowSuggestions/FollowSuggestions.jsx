import { useContext } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { LuUserPlus } from 'react-icons/lu'
import { AuthContext } from '../../Context/AuthContext.jsx'

export default function FollowSuggestions({ suggestionFollower, sugKey }) {
  const { token } = useContext(AuthContext)
  const {
    username,
    photo,
    name,
    mutualFollowersCount,
    followersCount,
    _id,
    id,
  } = suggestionFollower

  const userId = _id || id
  const queryClient = useQueryClient()

  function handleFollow() {
    return axios.put(
      `https://route-posts.routemisr.com/users/${userId}/follow`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
  }

  const { mutate, isPending } = useMutation({
    mutationFn: handleFollow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sugKey })
    },
  })

  return (
    <div className="rounded-xl border border-slate-200 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <img
            src={
              photo ||
              'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'
            }
            alt={name}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{name}</p>
            <p className="truncate text-xs text-slate-500">
              {username ? `@${username}` : 'route user'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => mutate()}
          disabled={isPending}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#e7f3ff] px-3 py-1.5 text-xs font-bold text-[#1877f2] transition hover:bg-[#d8ebff] disabled:opacity-60"
        >
          <LuUserPlus size={13} />
          {isPending ? 'Following...' : 'Follow'}
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
        <span className="rounded-full bg-slate-100 px-2 py-0.5">
          {followersCount || 0} followers
        </span>
        <span className="rounded-full bg-[#edf4ff] px-2 py-0.5 text-[#1877f2]">
          {mutualFollowersCount || 0} mutual
        </span>
      </div>
    </div>
  )
}
