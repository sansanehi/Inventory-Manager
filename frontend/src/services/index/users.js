import { supabase } from "../../config/supabase";

export const signup = async ({ name, email, password }) => {
  try {
    const { data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    return data;
  } catch (error) {
    // console.log(error.response.data);
    if (error.response && error.response.data)
      throw new Error(error.response.data);
    throw new Error(error.response.data);
  }
};

export const login = async ({ email, password }) => {
  try {
    const { data } = await supabase.auth.signIn({
      email,
      password,
    });
    return data;
  } catch (error) {
    // console.log(error.response.data);
    if (error.response && error.response.data)
      throw new Error(error.response.data);
    throw new Error(error.response.data);
  }
};

export const getUserProfile = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  return data.user;
};

export const updateProfile = async ({ name, email, password }) => {
  // Update email and password if provided
  let userUpdate = {};
  if (email) userUpdate.email = email;
  if (password) userUpdate.password = password;
  if (name) userUpdate.data = { name };
  const { data, error } = await supabase.auth.updateUser(userUpdate);
  if (error) throw new Error(error.message);
  return data.user;
};

export const updateProfilePicture = async ({ file }) => {
  // 1. Upload to Supabase Storage
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");
  const fileExt = file.name.split(".").pop();
  const filePath = `avatars/${user.id}.${fileExt}`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });
  if (uploadError) throw new Error(uploadError.message);

  // 2. Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);
  const avatarUrl = publicUrlData.publicUrl;

  // 3. Update user metadata
  const { data, error } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl },
  });
  if (error) throw new Error(error.message);
  return data.user;
};

// TODO: Implement Google sign-in with Supabase if needed
export const googleSignIn = async () => {
  throw new Error(
    "Google sign-in with Supabase not implemented here. Use authActions."
  );
};
