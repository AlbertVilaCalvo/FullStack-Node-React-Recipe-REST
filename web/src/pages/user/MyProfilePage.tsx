import { H1 } from '../../components/H1'
import { useSnapshot } from 'valtio'
import { userStore } from '../../user/userStore'

export function MyProfilePage() {
  const loggedUserStore = useSnapshot(userStore)

  return (
    <div className="main-container page">
      <div className="main-container-child-centered">
        <H1>My Profile</H1>
        <p>user.id: {loggedUserStore.user?.id}</p>
        <p>user.name: {loggedUserStore.user?.name}</p>
        <p>user.email: {loggedUserStore.user?.email}</p>
        <p>authToken: {loggedUserStore.authToken}</p>
      </div>
    </div>
  )
}
