export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            game_metadata: {
                Row: {
                    appid: number
                    igdb_id: number | null
                    name: string | null
                    genres: string[] | null
                    rating: number | null
                    summary: string | null
                    updated_at: string | null
                }
                Insert: {
                    appid: number
                    igdb_id?: number | null
                    name?: string | null
                    genres?: string[] | null
                    rating?: number | null
                    summary?: string | null
                    updated_at?: string | null
                }
                Update: {
                    appid?: number
                    igdb_id?: number | null
                    name?: string | null
                    genres?: string[] | null
                    rating?: number | null
                    summary?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
