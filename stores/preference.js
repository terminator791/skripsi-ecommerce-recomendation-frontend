import { defineStore } from 'pinia'

export const usePreferenceStore = defineStore('preference', {
    state: () => ({
        categories: [],
        brands: [],
        loading: false,
        saving: false,
        error: null,
        hasPreference: null, // null = unknown, true/false once checked
    }),

    actions: {
        // Catalog of categories & brands to choose from during onboarding.
        async fetchOptions() {
            try {
                this.loading = true
                this.error = null

                const baseUrl = useRuntimeConfig().public.apiRecommendationBaseUrl
                const response = await fetch(`${baseUrl}/api/v1/onboarding/options`, {
                    headers: { 'Content-Type': 'application/json' },
                })

                if (!response.ok) {
                    throw new Error('Gagal memuat pilihan personalisasi')
                }

                const result = await response.json()
                this.categories = result.categories || []
                this.brands = result.brands || []

                return result
            } catch (err) {
                this.error = err.message
                this.categories = []
                this.brands = []
            } finally {
                this.loading = false
            }
        },

        // Whether the logged-in user already completed onboarding.
        async checkPreference() {
            try {
                const baseUrl = useRuntimeConfig().public.apiUserBaseUrl
                const response = await fetch(`${baseUrl}/auth/preferences`, {
                    headers: {
                        'Authorization': `Bearer ${useCookie('token').value}`,
                        'Content-Type': 'application/json',
                    },
                })

                if (!response.ok) {
                    // Treat any failure as "unknown / assume has preference" so we
                    // never trap the user in onboarding on a transient error.
                    this.hasPreference = true
                    return true
                }

                const result = await response.json()
                this.hasPreference = !!result?.data?.has_preference
                return this.hasPreference
            } catch (err) {
                this.error = err.message
                this.hasPreference = true
                return true
            }
        },

        // Persist onboarding answers (canonical record + cold-start seed).
        async savePreference(payload) {
            try {
                this.saving = true
                this.error = null

                const baseUrl = useRuntimeConfig().public.apiUserBaseUrl
                const response = await fetch(`${baseUrl}/auth/preferences`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${useCookie('token').value}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        preferred_categories: payload.preferred_categories || [],
                        preferred_brands: payload.preferred_brands || [],
                        price_min: payload.price_min || 0,
                        price_max: payload.price_max || 0,
                    }),
                })

                const result = await response.json()
                if (!response.ok) {
                    throw new Error(result.message || 'Gagal menyimpan preferensi')
                }

                this.hasPreference = true
                return result
            } catch (err) {
                this.error = err.message
                throw err
            } finally {
                this.saving = false
            }
        },
    },
})
