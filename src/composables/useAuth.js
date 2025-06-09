import { ref, computed } from "vue"
import { supabase } from "./useSupabase"

const user = ref(null)
const userProfile = ref(null)
const loading = ref(false)

export const useAuth = () => {
  const isAuthenticated = computed(() => !!user.value)

  const getCurrentUser = async () => {
    try {
      loading.value = true
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (currentUser) {
        user.value = currentUser
        await getUserProfile(currentUser.id)
      }
    } catch (error) {
      console.error("Error getting current user:", error)
    } finally {
      loading.value = false
    }
  }

  const getUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.warn("Profile not found:", error)
      } else {
        userProfile.value = data
        console.log("Profile loaded:", data)
      }
    } catch (error) {
      console.error("Error getting user profile:", error)
    }
  }

  const signUp = async (email, password, userData) => {
    try {
      loading.value = true

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
            middle_name: userData.middle_name || "",
            contact_number: userData.contact_number || "",
            address: userData.address || "",
            role: "user",
          },
        },
      })

      if (error) {
        console.error("Supabase signup error:", error)
        throw error
      }

      console.log("Signup successful:", data)
      return { data, error: null }
    } catch (error) {
      console.error("Sign up error:", error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  const signIn = async (email, password) => {
    try {
      loading.value = true

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        user.value = data.user
        await getUserProfile(data.user.id)
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    try {
      loading.value = true
      console.log("Starting sign out process...")

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Supabase sign out error:", error)
        throw error
      }

      // Clear local state
      user.value = null
      userProfile.value = null

      console.log("Sign out successful")
      return { error: null }
    } catch (error) {
      console.error("Error signing out:", error)
      // Clear local state even if there's an error
      user.value = null
      userProfile.value = null
      return { error }
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (email) => {
    try {
      loading.value = true
      const { error } = await supabase.auth.resetPasswordForEmail(email)

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (updates) => {
    try {
      loading.value = true

      if (!user.value) throw new Error("No user logged in")

      const { error } = await supabase.from("user_profiles").update(updates).eq("user_id", user.value.id)

      if (error) throw error

      await getUserProfile(user.value.id)

      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      loading.value = false
    }
  }

  // Initialize auth state
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth state changed:", event, session?.user?.id)
    if (session?.user) {
      user.value = session.user
      await getUserProfile(session.user.id)
    } else {
      user.value = null
      userProfile.value = null
    }
  })

  // Get current user on initial load
  getCurrentUser()

  return {
    user,
    userProfile,
    loading,
    isAuthenticated,
    getCurrentUser,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  }
}
