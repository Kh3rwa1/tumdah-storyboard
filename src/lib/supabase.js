import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadImage(file, folder, userId) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const buckets = await supabase.storage.listBuckets();
    const bucketExists = buckets.data?.some(b => b.name === 'tumdah-images');

    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket('tumdah-images', {
        public: true,
        fileSizeLimit: 52428800
      });

      if (createError && !createError.message.includes('already exists')) {
        console.error('Bucket creation error:', createError);
      }
    }

    const { data, error } = await supabase.storage
      .from('tumdah-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('tumdah-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('uploadImage error:', error);
    throw error;
  }
}

export async function saveCharacter(name, imageUrl, userId) {
  const { data, error } = await supabase
    .from('saved_characters')
    .insert([
      { user_id: userId, name, image_url: imageUrl }
    ])
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getSavedCharacters(userId) {
  const { data, error } = await supabase
    .from('saved_characters')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function deleteCharacter(characterId, userId) {
  const { error } = await supabase
    .from('saved_characters')
    .delete()
    .eq('id', characterId)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}

export async function saveGeneratedScene(sceneData, userId) {
  const { data, error } = await supabase
    .from('generated_scenes')
    .insert([
      {
        user_id: userId,
        image_url: sceneData.imageUrl,
        action_prompt: sceneData.actionPrompt,
        background_prompt: sceneData.backgroundPrompt || '',
        aspect_ratio: sceneData.aspectRatio || '16:9 landscape',
        shot_type: sceneData.shotType || '',
        is_subject_removed: sceneData.isSubjectRemoved || false,
        is_scene_locked: sceneData.isSceneLocked !== undefined ? sceneData.isSceneLocked : true
      }
    ])
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getGeneratedScenes(userId) {
  const { data, error } = await supabase
    .from('generated_scenes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function deleteScene(sceneId, userId) {
  const { error } = await supabase
    .from('generated_scenes')
    .delete()
    .eq('id', sceneId)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}

export async function callGenerateSceneAPI(requestData) {
  const apiUrl = `${supabaseUrl}/functions/v1/generate-scene`;

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate scene');
  }

  return await response.json();
}
