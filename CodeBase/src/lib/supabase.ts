import { createClient } from "@supabase/supabase-js";

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const signUp = async (
  email: string,
  password: string,
  userData: any
) => {
  // First, create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { data: null, error: authError };
  }

  if (authData.user) {
    // Then create the profile record
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .insert([
        {
          id: authData.user.id,
          full_name: userData.full_name,
          username: userData.username,
          account_type: userData.account_type,
          organization: userData.organization,
          address: userData.address,
          phone: userData.phone,
        },
      ])
      .select()
      .single();

    if (profileError) {
      // If profile creation fails, we should handle this appropriately
      console.error("Error creating user profile:", profileError);
      return { data: authData, error: profileError };
    }

    return { data: { ...authData, profile: profileData }, error: null };
  }

  return { data: authData, error: null };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};

// Database helper functions
export const getFoodListings = async (filters = {}) => {
  let query = supabase.from("food_listings").select("*");

  // Apply filters if provided
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      query = query.eq(key, value);
    }
  });

  const { data, error } = await query.order("created_at", { ascending: false });
  return { data, error };
};

export const getUserDonations = async (userId: string) => {
  const { data, error } = await supabase
    .from("food_listings")
    .select("*")
    .eq("donor_id", userId)
    .order("created_at", { ascending: false });

  return { data, error };
};

export const getUserRequests = async (userId: string) => {
  const { data, error } = await supabase
    .from("food_requests")
    .select("*, food_listings(*)")
    .eq("requester_id", userId)
    .order("created_at", { ascending: false });

  return { data, error };
};

export const addFoodListing = async (listingData: any) => {
  const { data, error } = await supabase
    .from("food_listings")
    .insert([listingData])
    .select();

  return { data, error };
};

export const requestFood = async (requestData: any) => {
  const { data, error } = await supabase
    .from("food_requests")
    .insert([requestData])
    .select();

  return { data, error };
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select();

  return { data, error };
};

export const getLeaderboard = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, points, badges")
    .order("points", { ascending: false })
    .limit(10);

  return { data, error };
};

export const getAnalytics = async () => {
  const { data, error } = await supabase.from("analytics").select("*").single();

  return { data, error };
};
