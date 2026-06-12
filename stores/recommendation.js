import { defineStore } from 'pinia'

export const useRecommendationStore = defineStore('recommendation', {
    state: () => ({
        recommendations: [],
        pipelineInfo: null,
        loading: false,
        error: null,
        // PDP item-to-item "Produk Serupa"
        pdpRecommendations: [],
        pdpPipelineInfo: null,
        pdpLoading: false,
        pdpError: null,
    }),


    actions: {
        async fetchRecommendations(params = {}) {
            try {
                this.loading = true
                this.error = null

                const { limit, user_id } = params
                const query = new URLSearchParams()
                if (limit) query.append('limit', limit)
                if (user_id) query.append('user_id', user_id)

                const baseUrl = useRuntimeConfig().public.apiRecommendationBaseUrl
                const response = await fetch(`${baseUrl}/api/v1/recommendations?${query.toString()}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                const result = await response.json()

                // Map API response to ProductCard-compatible format
                this.recommendations = (result.data || []).map(item => ({
                    id: item.product_id,
                    product_name: item.product_name,
                    sale_price: item.sale_price,
                    reguler_price: item.reguler_price,
                    price: item.price,
                    rating: item.rating,
                    review_count: item.review_count,
                    sold_count: item.sold_count,
                    category_name: item.category_name,
                    product_image: item.image_url ? `${useRuntimeConfig().public.apiRecommendationBaseUrl}/${item.image_url}` : '/images/no-image-placeholder.png',
                    // Recommendation-specific fields
                    recommendation_score: item.score,
                    recommendation_rank: item.rank,
                }))

                this.pipelineInfo = {
                    user_id: result.user_id,
                    pipeline_type: result.pipeline_type,
                    stage1: result.stage1,
                    stage2: result.stage2,
                    total_latency_ms: result.total_latency_ms,
                }

                return result

            } catch (err) {
                this.error = err.message
                console.error('Error fetching recommendations:', err)
                // Silent fail - recommendations are optional
                this.recommendations = []
            } finally {
                this.loading = false
            }
        },

        async fetchPdpRecommendations(productId, limit = 5) {
            try {
                this.pdpLoading = true
                this.pdpError = null

                const baseUrl = useRuntimeConfig().public.apiRecommendationBaseUrl
                const response = await fetch(`${baseUrl}/recommend/pdp/${productId}?limit=${limit}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                const result = await response.json()

                // Map API response to ProductCard-compatible format
                this.pdpRecommendations = (result.data || []).map(item => ({
                    id: item.product_id,
                    product_name: item.product_name,
                    sale_price: item.sale_price,
                    reguler_price: item.reguler_price,
                    price: item.price,
                    rating: item.rating,
                    review_count: item.review_count,
                    sold_count: item.sold_count,
                    category_name: item.category_name,
                    product_image: item.image_url ? `${baseUrl}/${item.image_url}` : '/images/no-image-placeholder.png',
                    recommendation_score: item.score,
                    recommendation_rank: item.rank,
                }))

                this.pdpPipelineInfo = {
                    anchor_id: result.anchor_id,
                    pipeline_type: result.pipeline_type,
                    stage1: result.stage1,
                    stage2: result.stage2,
                    total_latency_ms: result.total_latency_ms,
                }

                return result

            } catch (err) {
                this.pdpError = err.message
                console.error('Error fetching PDP recommendations:', err)
                // Silent fail - recommendations are optional
                this.pdpRecommendations = []
            } finally {
                this.pdpLoading = false
            }
        }
    }
})

