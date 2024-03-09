import { create } from 'zustand'

interface AccountState {
    account: any
    setAccount: (by: any) => void
}

export const useSnapAccountStore = create<AccountState>()((set) => ({
    account: null,
    setAccount: (v:any) => set(() => ({ account: v })),
}))