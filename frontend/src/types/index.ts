export type UserRole = 'ADMIN' | 'BHW' | 'HOSPITAL_ENCODER' | 'RESIDENT'
export type CaseStatus = 'SUSPECTED' | 'CONFIRMED'
export type CaseSource = 'PUBLIC_HOSPITAL' | 'PRIVATE_HOSPITAL' | 'RHU' | 'BHW'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type AlertStatus = 'ACTIVE' | 'RESOLVED' | 'DISMISSED'

export interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    role: UserRole
    barangayId?: string | null
    isActive: boolean
    barangay?: Barangay
}

export interface Barangay {
    id: string
    name: string
    code: string
    municipality: string
    province: string
    population?: number
}

export interface DengueCase {
    id: string
    barangayId: string
    reportedBy: string
    dateReported: string
    age: number
    ageGroup: string
    status: CaseStatus
    source: CaseSource
    notes?: string
    barangay?: Barangay
    reporter?: User
}

export interface EnvironmentalReport {
    id: string
    barangayId: string
    reportedBy: string
    dateReported: string
    stagnantWater: boolean
    poorWasteDisposal: boolean
    cloggedDrainage: boolean
    housingCongestion: boolean
    photoUrl?: string
    notes?: string
    barangay?: Barangay
    reporter?: User
}

export interface Alert {
    id: string
    barangayId: string
    createdBy?: string
    title: string
    message: string
    riskLevel: RiskLevel
    status: AlertStatus
    triggeredAt: string
    resolvedAt?: string
    metadata?: string
    barangay?: Barangay
    creator?: User
}


