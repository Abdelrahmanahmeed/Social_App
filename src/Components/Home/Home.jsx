import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useContext, useState } from 'react'
import { ClipLoader } from 'react-spinners'
import { FaRegBookmark } from 'react-icons/fa'
import {
  LuUsers,
  LuSearch,
  LuEarth,
  LuSparkles,
  LuNewspaper,
} from 'react-icons/lu'
import { AuthContext } from '../../Context/AuthContext.jsx'
import PostCard from '../PostCard/PostCard.jsx'
import FollowSuggestions from '../FollowSuggestions/FollowSuggestions.jsx'
import PostCreation from '../PostCreation/PostCreation.jsx'

async function getAllPosts(token) {
  const { data } = await axios.get('https://route-posts.routemisr.com/posts', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data.data.posts
}

async function getSuggestionUsers(token) {
  const { data } = await axios.get(
    'https://route-posts.routemisr.com/users/suggestions?limit=10',
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return data.data.suggestions
}

async function getSavedPosts(token) {
  const { data } = await axios.get(
    'https://route-posts.routemisr.com/users/bookmarks',
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return data.data.bookmarks
}

async function getMyPosts(token, userId) {
  const { data } = await axios.get(
    `https://route-posts.routemisr.com/users/${userId}/posts`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return data.data.posts
}

async function getCommunityPosts(token) {
  const { data } = await axios.get(
    'https://route-posts.routemisr.com/posts/feed?only=following&limit=10',
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return data.data.posts
}

export default function Home() {
  const [active, setActive] = useState('feed')
  const [postFilter, setPostFilter] = useState('all')
  const { token, userData } = useContext(AuthContext)
  const [searchTerm, setSearchTerm] = useState('')
  const userId = userData?._id

  const { data: allPosts = [], isLoading, isError, error } = useQuery({
    queryKey: ['posts', token],
    queryFn: () => getAllPosts(token),
    enabled: !!token,
  })

  const { data: suggestions = [], isLoading: suggestionsLoading, isError: suggestionsError } =
    useQuery({
      queryKey: ['suggestionUsers', token],
      queryFn: () => getSuggestionUsers(token),
      enabled: !!token,
    })

  const { data: savedPosts = [] } = useQuery({
    queryKey: ['savedPosts', token],
    queryFn: () => getSavedPosts(token),
    enabled: !!token && postFilter === 'saved',
  })

  const { data: myPosts = [] } = useQuery({
    queryKey: ['myPosts', token, userId],
    queryFn: () => getMyPosts(token, userId),
    enabled: !!token && !!userId && postFilter === 'myPosts',
  })

  const { data: communityPosts = [] } = useQuery({
    queryKey: ['communityPosts', token],
    queryFn: () => getCommunityPosts(token),
    enabled: !!token && postFilter === 'community',
  })

  const filteredSuggestions =
    suggestions?.filter((user) =>
      `${user.name || ''} ${user.username || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    ) || []

  const postsToShow =
    postFilter === 'saved'
      ? savedPosts
      : postFilter === 'myPosts'
        ? myPosts
        : postFilter === 'community'
          ? communityPosts
          : allPosts

  const postsQueryKey =
    postFilter === 'saved'
      ? ['savedPosts', token]
      : postFilter === 'myPosts'
        ? ['myPosts', token, userId]
        : postFilter === 'community'
          ? ['communityPosts', token]
          : ['posts', token]

  const navButtonClass = (key) =>
    `mt-2 flex w-full items-center gap-3 rounded-2xl border-none px-4 py-2 transition first:mt-4 ${
      active === key
        ? 'bg-blue-100 text-blue-600'
        : 'text-slate-700 hover:bg-[#F1F5F9]'
    }`

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-6 pb-6 pt-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-6 md:grid-cols-12">
        <aside className="order-1 self-start md:col-span-3 lg:sticky lg:top-[4.25rem]">
          <div className="rounded-2xl bg-white px-4 pb-4 shadow-sm">
            <button
              type="button"
              onClick={() => {
                setActive('feed')
                setPostFilter('all')
              }}
              className={navButtonClass('feed')}
            >
              <LuNewspaper size={18} />
              <p className="text-[14px] font-bold">Feed</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setActive('myposts')
                setPostFilter('myPosts')
              }}
              className={navButtonClass('myposts')}
            >
              <LuSparkles size={18} />
              <p className="text-[14px] font-bold">My Posts</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setActive('community')
                setPostFilter('community')
              }}
              className={navButtonClass('community')}
            >
              <LuEarth size={18} />
              <p className="text-[14px] font-bold">Community</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setActive('saved')
                setPostFilter('saved')
              }}
              className={navButtonClass('saved')}
            >
              <FaRegBookmark size={18} />
              <p className="text-[14px] font-bold">Saved</p>
            </button>
          </div>
        </aside>

        {/* Center - Posts feed */}
        <main className="order-3 min-w-0 md:order-2 md:col-span-6">
          <PostCreation queryKey={['posts', token]} />

          {isLoading && postFilter === 'all' && (
            <div className="mt-10 flex justify-center">
              <ClipLoader color="#00298d" size={45} />
            </div>
          )}

          {isError && postFilter === 'all' && (
            <p className="mt-4 text-center text-sm text-red-500">
              {error.response?.data?.message || 'Failed to load posts'}
            </p>
          )}

          <div className="mt-5 space-y-4">
            {postsToShow?.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
                No posts yet.
              </div>
            ) : (
              postsToShow?.map((post) => (
                <PostCard key={post._id} post={post} queryKey={postsQueryKey} />
              ))
            )}
          </div>
        </main>

        {/* Right - Suggested Friends */}
        <aside className="order-2 self-start md:order-3 md:col-span-3 lg:sticky lg:top-[4.25rem]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <LuUsers size={18} className="text-[#1877f2]" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Suggested Friends
                </h3>
              </div>

              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                {filteredSuggestions.length}
              </span>
            </div>

            <div className="mb-3">
              <label className="relative block">
                <LuSearch
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search friends..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-[#1877f2] focus:bg-white"
                />
              </label>
            </div>

            {suggestionsLoading && (
              <div className="flex justify-center py-6">
                <ClipLoader color="#00298d" size={28} />
              </div>
            )}

            {suggestionsError && (
              <p className="text-center text-sm text-red-500">
                Failed to load suggestions
              </p>
            )}

            <div className="space-y-3">
              {filteredSuggestions.slice(0, 5).map((user) => (
                <FollowSuggestions
                  key={user._id}
                  suggestionFollower={user}
                  sugKey={['suggestionUsers', token]}
                />
              ))}

              {!suggestionsLoading && filteredSuggestions.length === 0 && (
                <p className="text-center text-sm text-slate-500">
                  No suggestions found
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
