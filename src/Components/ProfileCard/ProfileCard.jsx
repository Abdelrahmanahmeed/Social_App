import { useContext, useRef, useState } from 'react'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { HiOutlineMail } from 'react-icons/hi'
import { FiUser } from 'react-icons/fi'
import { LuCamera, LuExpand, LuUsers, LuFileText, LuBookmark } from 'react-icons/lu'
import { ClipLoader } from 'react-spinners'
import { AuthContext } from '../../Context/AuthContext.jsx'
import PostCard from '../PostCard/PostCard.jsx'

const DEFAULT_PHOTO =
  'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'

export default function ProfileCard({ user, profileQueryKey }) {
  const {
    photo,
    name,
    username,
    followersCount,
    followingCount,
    email,
    bookmarksCount,
    _id,
    id,
  } = user || {}

  const userId = _id || id
  const { token, setUserData } = useContext(AuthContext)
  const queryClient = useQueryClient()

  const [previewImage, setPreviewImage] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')
  const [hasPendingPhoto, setHasPendingPhoto] = useState(false)
  const changedImageRef = useRef(null)

  const myPostsQueryKey = ['myPosts', token, userId]
  const savedPostsQueryKey = ['savedPosts', token]

  async function getMyPosts() {
    const { data } = await axios.get(
      `https://route-posts.routemisr.com/users/${userId}/posts`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return data.data.posts
  }

  async function getSavedPosts() {
    const { data } = await axios.get(
      'https://route-posts.routemisr.com/users/bookmarks',
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return data.data.bookmarks
  }

  const {
    data: profilePosts = [],
    isLoading: postsLoading,
    isError: postsError,
    error: postsErrorMessage,
  } = useQuery({
    queryKey: myPostsQueryKey,
    queryFn: getMyPosts,
    enabled: !!token && !!userId,
  })

  const { data: savedPosts = [], isLoading: savedLoading } = useQuery({
    queryKey: savedPostsQueryKey,
    queryFn: getSavedPosts,
    enabled: !!token,
  })

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setPreviewImage(URL.createObjectURL(file))
    setHasPendingPhoto(true)
    setShowModal(true)
  }

  function handleProfilePhotoUpload() {
    const formData = new FormData()

    if (changedImageRef.current?.files?.[0]) {
      formData.append('photo', changedImageRef.current.files[0])
    }

    return axios.put(
      'https://route-posts.routemisr.com/users/upload-photo',
      formData,
      { headers: { Authorization: `Bearer ${token}` } },
    )
  }

  const { mutate: uploadPhoto, isPending: isUploading } = useMutation({
    mutationFn: handleProfilePhotoUpload,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profileQueryKey })

      const { data } = await axios.get(
        'https://route-posts.routemisr.com/users/profile-data',
        { headers: { Authorization: `Bearer ${token}` } },
      )

      const updatedUser = data?.data?.user ?? data?.data
      if (updatedUser) {
        setUserData(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }

      setShowModal(false)
      setHasPendingPhoto(false)
      if (changedImageRef.current) {
        changedImageRef.current.value = ''
      }
    },
  })

  if (!user) return null

  const shownPosts = activeTab === 'posts' ? profilePosts : savedPosts
  const shownCount = shownPosts.length
  const postsQueryKey = activeTab === 'posts' ? myPostsQueryKey : savedPostsQueryKey
  const isCurrentTabLoading =
    activeTab === 'posts' ? postsLoading : savedLoading
  const isCurrentTabError = activeTab === 'posts' ? postsError : false
  const currentTabErrorMessage = postsErrorMessage

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-3 py-4">
      <div className="mx-auto max-w-4xl space-y-5">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-40 bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#5f8fb8] sm:h-48" />

          <div className="relative -mt-12 px-4 pb-6 sm:-mt-14 sm:px-6">
            <div className="rounded-2xl border border-white/60 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex min-w-0 items-end gap-4">
                  <div className="group/avatar relative shrink-0">
                    <img
                      alt={name}
                      src={photo || DEFAULT_PHOTO}
                      className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md ring-2 ring-[#dbeafe] sm:h-28 sm:w-28"
                    />

                    <button
                      type="button"
                      className="absolute bottom-1 left-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1877f2] shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 sm:opacity-0 sm:group-hover/avatar:opacity-100"
                      onClick={() => {
                        setPreviewImage(photo || DEFAULT_PHOTO)
                        setShowModal(true)
                      }}
                      aria-label="View profile photo"
                    >
                      <LuExpand size={15} />
                    </button>

                    <label className="absolute bottom-1 right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#1877f2] text-white shadow-sm transition hover:bg-[#166fe5] sm:opacity-0 sm:group-hover/avatar:opacity-100">
                      <LuCamera size={16} />
                      <input
                        ref={changedImageRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>

                  <div className="min-w-0 pb-1">
                    <h1 className="truncate text-2xl font-black text-slate-900 sm:text-3xl">
                      {name}
                    </h1>
                    {username && (
                      <p className="mt-1 text-base font-semibold text-slate-500">
                        @{username}
                      </p>
                    )}
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#d7e7ff] bg-[#eef6ff] px-3 py-1 text-xs font-bold text-[#0b57d0]">
                      <LuUsers size={13} />
                      Route Posts member
                    </div>
                  </div>
                </div>

                <div className="grid w-full grid-cols-3 gap-2 sm:max-w-md">
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Followers
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-900">
                      {followersCount ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Following
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-900">
                      {followingCount ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Saved
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-900">
                      {bookmarksCount ?? savedPosts.length ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h2 className="text-sm font-extrabold text-slate-800">About</h2>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  {email && (
                    <p className="flex items-center gap-2">
                      <HiOutlineMail className="text-slate-500" size={15} />
                      {email}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <FiUser className="text-slate-500" size={15} />
                    Active on Route Posts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="grid w-full grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5 sm:inline-flex sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('posts')}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                  activeTab === 'posts'
                    ? 'bg-white text-[#1877f2] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LuFileText size={15} />
                My Posts
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('saved')}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                  activeTab === 'saved'
                    ? 'bg-white text-[#1877f2] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LuBookmark size={15} />
                Saved
              </button>
            </div>

            <span className="rounded-full bg-[#e7f3ff] px-3 py-1 text-xs font-bold text-[#1877f2]">
              {shownCount}
            </span>
          </div>

          {isCurrentTabLoading && (
            <div className="flex justify-center py-10">
              <ClipLoader color="#00298d" size={36} />
            </div>
          )}

          {isCurrentTabError && (
            <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {currentTabErrorMessage?.response?.data?.message || 'Failed to load posts'}
            </p>
          )}

          {!isCurrentTabLoading && !isCurrentTabError && (
            <div className="space-y-4">
              {shownPosts.length > 0 ? (
                shownPosts.map((post) => (
                  <PostCard
                    key={post._id || post.id}
                    post={post}
                    queryKey={postsQueryKey}
                  />
                ))
              ) : (
                <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                  {activeTab === 'posts'
                    ? 'You have not posted yet.'
                    : 'You have no saved posts yet.'}
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              {hasPendingPhoto ? 'Update profile photo' : 'Profile photo'}
            </h2>

            <div className="mb-6 flex justify-center">
              <img
                src={previewImage || photo || DEFAULT_PHOTO}
                alt="Preview"
                className="h-48 w-48 rounded-full object-cover sm:h-64 sm:w-64"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false)
                  setHasPendingPhoto(false)
                  if (changedImageRef.current) {
                    changedImageRef.current.value = ''
                  }
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              {hasPendingPhoto && (
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => uploadPhoto()}
                  className="rounded-lg bg-[#1877f2] px-4 py-2 text-sm font-bold text-white hover:bg-[#166fe5] disabled:opacity-60"
                >
                  {isUploading ? 'Saving...' : 'Save photo'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
