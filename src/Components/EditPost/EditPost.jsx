import { useContext, useRef, useState } from 'react'
import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthContext } from '../../Context/AuthContext.jsx'
import { showToast } from '../../utils/showToast.js'
import { IoMdClose } from 'react-icons/io'
import { FaRegImage, FaRegSmile } from 'react-icons/fa'
import { IoSend } from 'react-icons/io5'

export default function EditPost({ post, queryKey = ['posts'], setIsEditing }) {
  const postId = post?._id || post?.id
  const { body = '', image, user = {} } = post || {}

  const textRef = useRef(null)
  const imageRef = useRef(null)
  const { token } = useContext(AuthContext)
  const [imagePreview, setImagePreview] = useState(image || null)
  const [removeImage, setRemoveImage] = useState(false)
  const queryClient = useQueryClient()
  const photoInputId = `edit-photo-${postId}`
  const firstName = user?.name?.split(' ')[0] || 'friend'

  function handleChangeImage(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setImagePreview(URL.createObjectURL(file))
    setRemoveImage(false)
  }

  function handleClearImage() {
    setImagePreview(null)
    setRemoveImage(true)

    if (imageRef.current) {
      imageRef.current.value = ''
    }
  }

  function handleCancel() {
    if (textRef.current) {
      textRef.current.value = body || ''
    }

    setImagePreview(image || null)
    setRemoveImage(false)

    if (imageRef.current) {
      imageRef.current.value = ''
    }

    setIsEditing(false)
  }

  async function handleEditPost() {
    const formData = new FormData()

    formData.append('body', textRef.current?.value?.trim() || '')

    const file = imageRef.current?.files?.[0]
    if (file) {
      formData.append('image', file)
    }

    if (removeImage) {
      formData.append('removeImage', 'true')
    }

    const { data } = await axios.put(
      `https://route-posts.routemisr.com/posts/${postId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    return data
  }

  const { mutate, isPending } = useMutation({
    mutationFn: handleEditPost,
    onSuccess: () => {
      showToast('Post edited successfully')
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: ['savedPosts'] })
      queryClient.invalidateQueries({ queryKey: ['myPosts'] })
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] })
      setIsEditing(false)
    },
    onError: () => {
      showToast('Failed to update post', 'error')
    },
  })

  return (
    <article className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      <div className="p-4">
        <div className="mb-3 flex items-start gap-3">
          <img
            alt={user?.name || 'User'}
            className="h-11 w-11 rounded-full object-cover"
            src={
              user?.photo ||
              'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png'
            }
          />

          <div className="flex-1">
            <p className="text-base font-extrabold text-slate-900">
              {user?.name || 'User'}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Editing post</p>
          </div>
        </div>

        <div className="relative">
          <textarea
            ref={textRef}
            rows={4}
            defaultValue={body || ''}
            placeholder={`What's on your mind, ${firstName}?`}
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
              htmlFor={photoInputId}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              <FaRegImage size={18} className="text-emerald-600" />
              <span className="hidden sm:inline">Photo/video</span>
            </label>

            <input
              id={photoInputId}
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => mutate()}
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-[#1877f2] px-5 py-2 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#166fe5] disabled:opacity-60"
            >
              {isPending ? 'Updating...' : 'Update'}
              <IoSend size={16} />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
