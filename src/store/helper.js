import { cloneDeep } from 'lodash-es'
import api from '@/api'
import { basePermissions } from '@/settings'

export async function getUserInfo() {
  const res = await api.getUser()
  const { username, avatar } = res.data || {}
  return {
    username,
    avatar,
  }
}

export async function getPermissions() {
  let asyncPermissions = []
  try {
    const res = await api.getRolePermissions()
    asyncPermissions = res?.data || []
  }
  catch (error) {
    console.error(error)
  }
  return cloneDeep(basePermissions).concat(asyncPermissions)
}
