import { useContext, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ClipLoader } from 'react-spinners'
import { AuthContext } from '../../Context/AuthContext.jsx'
import ProfileCard from '../ProfileCard/ProfileCard.jsx'

function normalizeProfileResponse(data) {
  const payload = data?.data
  if (!payload) return null

  if (payload.user && typeof payload.user === 'object') {
    return {
      ...payload.user,
      followersCount: payload.followersCount ?? payload.user.followersCount ?? 0,
      followingCount: payload.followingCount ?? payload.user.followingCount ?? 0,
      bookmarksCount: payload.bookmarksCount ?? payload.user.bookmarksCount ?? 0,
    }
  }

  return payload
}

async function getProfileData(token) {
  const { data } = await axios.get(
    'https://route-posts.routemisr.com/users/profile-data',
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  return normalizeProfileResponse(data)
}

export default function Profile() {
  const { token, userData, setUserData } = useContext(AuthContext)

  const {
    data: profileUser,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['profile', token],
    queryFn: () => getProfileData(token),
    enabled: !!token,
  })

  const user = profileUser || userData

  useEffect(() => {
    if (!profileUser) return
    setUserData(profileUser)
    localStorage.setItem('user', JSON.stringify(profileUser))
  }, [profileUser, setUserData])

  if (!token) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F8FAFC] px-4">
        <p className="text-sm text-slate-500">Please log in to view your profile.</p>
      </div>
    )
  }

  if (isLoading && !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F8FAFC]">
        <ClipLoader color="#00298d" size={45} />
      </div>
    )
  }

  if (isError && !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F8FAFC] px-4">
        <p className="text-sm text-red-500">
          {error?.response?.data?.message || 'Failed to load profile'}
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F8FAFC] px-4">
        <p className="text-sm text-slate-500">Profile not found</p>
      </div>
    )
  }

  return <ProfileCard user={user} profileQueryKey={['profile', token]} />
}
