import type { AppRole } from './types'

export type PermissionSet = {
  canViewChildTree: boolean
  canViewHomework: boolean
  canRecordPractice: boolean
  canManageRewards: boolean
  canConfirmPieces: boolean
  canRecordConcerts: boolean
  canViewHistory: boolean
  canScoreHomework: boolean
  canWriteTeacherComment: boolean
  canAssignHomework: boolean
  canEditHomework: boolean
}

export const rolePermissions: Record<AppRole, PermissionSet> = {
  child: {
    canViewChildTree: true,
    canViewHomework: true,
    canRecordPractice: false,
    canManageRewards: false,
    canConfirmPieces: false,
    canRecordConcerts: false,
    canViewHistory: true,
    canScoreHomework: false,
    canWriteTeacherComment: false,
    canAssignHomework: false,
    canEditHomework: false,
  },
  parent: {
    canViewChildTree: true,
    canViewHomework: true,
    canRecordPractice: true,
    canManageRewards: true,
    canConfirmPieces: true,
    canRecordConcerts: true,
    canViewHistory: true,
    canScoreHomework: false,
    canWriteTeacherComment: false,
    canAssignHomework: false,
    canEditHomework: false,
  },
  teacher: {
    canViewChildTree: true,
    canViewHomework: true,
    canRecordPractice: false,
    canManageRewards: false,
    canConfirmPieces: true,
    canRecordConcerts: false,
    canViewHistory: true,
    canScoreHomework: true,
    canWriteTeacherComment: true,
    canAssignHomework: true,
    canEditHomework: true,
  },
}

export const getPermissionsForRole = (role: AppRole): PermissionSet => rolePermissions[role]

export const MVP_ROLE_NOTE =
  'MVP role selection controls the interface only. Real authentication and permissions will be added with Firebase in a later phase.'
