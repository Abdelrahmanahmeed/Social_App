import { useContext, useRef, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { FaRegImage, FaRegSmile } from 'react-icons/fa'
import { IoMdClose } from 'react-icons/io'
import { IoSend } from 'react-icons/io5'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthContext } from '../../Context/AuthContext.jsx'

export default function PostCreation({ queryKey = ['posts'] }) {
  const { userData, token } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const imageRef = useRef(null)
  const textRef = useRef(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [privacy, setPrivacy] = useState('public')

  function handleChangeImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImagePreview(URL.createObjectURL(file))
  }

  function handleClearImage() {
    setImagePreview(null)
    if (imageRef.current) {
      imageRef.current.value = ''
    }
  }

  async function createPost() {
    const postData = new FormData()

    if (imageRef.current?.files?.length > 0) {
      postData.append('image', imageRef.current.files[0])
    }

    if (textRef.current?.value?.trim()) {
      postData.append('body', textRef.current.value.trim())
    }

    const response = await axios.post(
      'https://route-posts.routemisr.com/posts',
      postData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    return response.data
  }

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      setStatusMessage('Post created successfully')
      setTimeout(() => setStatusMessage(''), 3000)
      queryClient.invalidateQueries({ queryKey })

      if (textRef.current) {
        textRef.current.value = ''
      }

      handleClearImage()
      setPrivacy('public')
    },
    onError: () => {
      setStatusMessage('Failed to create post')
      setTimeout(() => setStatusMessage(''), 3000)
    },
  })

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start gap-3">
        <Link to="/profile">
          <img
            alt={userData?.name || 'User'}
            className="h-11 w-11 rounded-full object-cover"
            src={
              userData?.photo ||
              'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'
            }
          />
        </Link>

        <div className="flex-1">
          <Link to="/profile" className="block">
            <p className="text-base font-extrabold text-slate-900">
              {userData?.name || 'User'}
            </p>
          </Link>

          <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="bg-transparent outline-none"
            >
              <option value="public">Public</option>
              <option value="following">Followers</option>
              <option value="only_me">Only me</option>
            </select>
          </div>
        </div>
      </div>

      <div className="relative">
        <textarea
          ref={textRef}
          rows={4}
          placeholder={`What's on your mind, ${
            userData?.name?.split(' ')[0] || 'user'
          }?`}
          className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[17px] leading-relaxed text-slate-800 outline-none transition focus:border-[#1877f2] focus:bg-white"
        />
      </div>

      {imagePreview && (
        <div className="relative mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-[#F0F2F5]">
          <button
            type="button"
            onClick={handleClearImage}
            className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1 shadow-sm transition hover:bg-white"
          >
            <IoMdClose size={18} />
          </button>

          <img
            src={imagePreview}
            alt="Preview"
            className="mx-auto max-h-[min(400px,50vh)] w-full object-contain"
          />
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
        <div className="relative flex items-center gap-2">
          <label
            htmlFor="post-image"
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            <FaRegImage size={18} className="text-emerald-600" />
            <span className="hidden sm:inline">Photo/video</span>
          </label>

          <input
            id="post-image"
            ref={imageRef}
            accept="image/*"
            className="hidden"
            type="file"
            onChange={handleChangeImage}
          />

          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            <FaRegSmile size={18} className="text-amber-500" />
            <span className="hidden sm:inline">Feeling/activity</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => mutate()}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-[#1877f2] px-5 py-2 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#166fe5] disabled:opacity-60"
          >
            {isPending ? 'Posting...' : 'Post'}
            <IoSend size={16} />
          </button>
        </div>
      </div>

      {statusMessage && (
        <p
          className={`mt-3 text-sm font-medium ${
            isError ? 'text-red-500' : 'text-green-600'
          }`}
        >
          {isError
            ? error?.response?.data?.message || statusMessage
            : statusMessage}
        </p>
      )}
    </div>
  )
}
