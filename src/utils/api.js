const apiKey = "";
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;

export const SHOT_TYPES = [
  "ESTABLISHING SHOT (ULTRA WIDE)",
  "FULL SHOT (SUBJECT FULL BODY)",
  "MEDIUM SHOT (SUBJECT WAIST UP)",
  "CLOSE UP (SUBJECT FACE)",
  "OVER-THE-SHOULDER SHOT",
  "LOW ANGLE SHOT (LOOKING UP)",
  "HIGH ANGLE SHOT (LOOKING DOWN)",
  "DUTCH ANGLE SHOT (TILTED)",
  "INSERT SHOT (DETAIL)"
];

export const SKELETON_STATE = Array(9).fill(null);

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const fetchWithRetry = async (url, options, retries = 5, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status} ${response.statusText}`);
      }
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
    }
  }
};

export const imageToApiPart = async (file) => {
  if (!file) return null;
  const base64Data = await fileToBase64(file);
  return {
    inlineData: {
      mimeType: file.type,
      data: base64Data.split(',')[1]
    }
  };
};

export const callGeminiAPI = async (
  actionPrompt,
  backgroundPrompt,
  baseImagePart,
  styleImagePart,
  shotType,
  isSubjectRemoved,
  additionalCharacterParts = [],
  elementImageParts = [],
  isOverrideMode = false,
  isSceneLocked = true,
  aspectRatio = "16:9 landscape"
) => {
  let fullPrompt = "";
  const hasExtraChars = additionalCharacterParts.length > 0;
  const hasExtraElements = elementImageParts.length > 0;

  const environmentLockInstruction = isSceneLocked
    ? "**CRITICAL ENVIRONMENT LOCK:** The environment, including all objects, props, and background details (e.g., 'a red car', 'a specific crack in the wall'), MUST be 100% identical and persistent across all 9 shots. Only the camera angle changes."
    : "";

  const backgroundInstruction = backgroundPrompt
    ? `Use this description for the scene's setting: "${backgroundPrompt}".`
    : "";

  const aspectRatioInstruction = `**CRITICAL FORMAT:** The generated image MUST be a ${aspectRatio} image.`;

  if (isOverrideMode) {
    const asset1 = "ASSET 1 (SOURCE): Single Image. Use this image for SUBJECT identity (face, outfit) AND the full ENVIRONMENT (location, objects, style, lighting).";

    if (isSubjectRemoved) {
      fullPrompt = `
        **ROLE:** AI Art Director (Override Mode, Subject Removed)
        **GOAL:** Re-render an environment, but remove the main subject and execute a prompt.
        ${aspectRatioInstruction}
        **ASSETS:**
        * ${asset1}
        **INSTRUCTIONS:**
        1.  **SHOT TYPE (PRIMARY):** Render this shot: "${shotType}".
        2.  **SUBJECT OMISSION (CRITICAL):** You MUST NOT include the MAIN SUBJECT from ASSET 1.
        3.  **ENVIRONMENT:** You MUST re-create the full ENVIRONMENT (location, objects, style, lighting) from ASSET 1. ${backgroundInstruction} ${environmentLockInstruction}
        4.  **ACTION & ELEMENTS:** The text prompt is: "${actionPrompt}". You must LITERALLY render this prompt happening in the environment.
        **SUMMARY:** Create a NEW ${aspectRatio} "${shotType}" image of the environment from ASSET 1, but WITHOUT the main subject, and WITH the prompt "${actionPrompt}" happening.
      `;
    } else {
      fullPrompt = `
        **ROLE:** AI Art Director (Override Mode, Subject In)
        **GOAL:** Re-render a scene, changing only the camera angle and subject's pose.
        ${aspectRatioInstruction}
        **ASSETS:**
        * ${asset1} **CRITICAL: Use this image for IDENTITY (face, outfit) ONLY. The subject's POSE from this image MUST BE 100% IGNORED.**
        **INSTRUCTIONS:**
        1.  **SHOT TYPE (PRIMARY):** Render this shot: "${shotType}".
        2.  **SUBJECT:** The subject's identity (face, outfit) is from ASSET 1.
        3.  **ENVIRONMENT:** The environment (location, objects, style, lighting) is from ASSET 1. ${backgroundInstruction} ${environmentLockInstruction}
        4.  **ACTION (CRITICAL):** The subject MUST perform this action: "${actionPrompt}".
        5.  **POSE (CRITICAL):** Pose is defined *only* by the ACTION: "${actionPrompt}". **DO NOT, under any circumstances, copy the POSE from ASSET 1.** The subject's pose MUST be new.
        6.  **CRITICAL ANATOMY:** All human subjects MUST have correct anatomy. No malformed limbs, extra fingers, or distorted faces. This is a top priority. Double-check all limbs and hands.
        7.  **CRITICAL FACE CONSISTENCY:** The subject's face MUST be 100% consistent with ASSET 1 in every shot. This is more important than the outfit if a choice must be made.
        **SUMMARY:** Create a NEW ${aspectRatio} "${shotType}" image. The subject AND environment are from ASSET 1, but the subject's POSE is new and defined by "${actionPrompt}".
      `;
    }
  } else if (!baseImagePart) {
    const asset1 = "ASSET 1 (STYLE): Image 1. Use ONLY for AESTHETIC, VIBE, LIGHTING, and COLOR GRADE. **CRITICAL: IGNORE ALL CONTENT (people, objects, setting, location) from this image. ZERO CONTENT LEAK.** The scene's environment must be newly generated but *feel* like this image.";
    const asset2 = hasExtraChars ? `ASSET 2...${2 + additionalCharacterParts.length - 1} (ADDITIONAL SUBJECTS): Use these images ONLY for each additional subject's **IDENTITY** (face, outfit). Their **POSE** in this image is irrelevant and **MUST BE 100% IGNORED**.` : "";
    const asset3 = hasExtraElements ? `ASSET ${2 + additionalCharacterParts.length}... (ELEMENTS): Final images in set. Extract the key objects/elements from these images (e.g., 'a specific car', 'a snake') and integrate ONLY those elements into the scene. DO NOT copy the background or style from these images.` : "";

    fullPrompt = `
      **ROLE:** AI Art Director (Style-Only Mode)
      **GOAL:** Create a shot of a new environment, based on a Style image, with secondary characters/elements.
      ${aspectRatioInstruction}
      **ASSETS:**
      * ${asset1}
      * ${asset2}
      * ${asset3}
      **INSTRUCTIONS:**
      1.  **SHOT TYPE (PRIMARY):** Render this shot: "${shotType}".
      2.  **ALL SUBJECTS (CRITICAL):** There is NO main subject. If ${hasExtraChars}, all ADDITIONAL SUBJECTS are defined by ASSET 2+. You MUST treat all of these as **HUMAN SUBJECTS** who will perform the action. **DO NOT** treat them as static objects.
      3.  **ENVIRONMENT & LIGHTING (CRITICAL):**
          * Create a NEW environment that matches the STYLE of ASSET 1 (vibe, lighting, color). ${backgroundInstruction}
          * **CRITICAL: DO NOT copy the location, setting, or any objects/people from ASSET 1.** ${environmentLockInstruction}
          * If ${hasExtraChars}, you **MUST** apply the lighting, shadows, and color grade from ASSET 1 *onto* all subjects. They must look naturally integrated and blended.
      4.  **ACTION (CRITICAL):** All subjects MUST perform this action: "${actionPrompt}".
      5.  **POSE (CRITICAL):** Pose is defined *only* by the ACTION: "${actionPrompt}". **DO NOT COPY THE POSE FROM ANY ASSET IMAGE (ASSET 2+). ALL POSES MUST BE NEWLY GENERATED.**
      6.  **ELEMENTS:** If ${hasExtraElements}, add all extracted ELEMENTS from ASSET 3+.
      7.  **CRITICAL ANATOMY:** If ${hasExtraChars}, you MUST ensure 100% correct human anatomy for all subjects. No malformed limbs or distorted faces. Double-check all limbs and hands.
      8.  **CRITICAL FACE CONSISTENCY:** All Additional Subjects' faces MUST be 100% consistent with their respective ASSET images (ASSET 2+).
      **SUMMARY:** Create a NEW ${aspectRatio} "${shotType}" image. A new environment (matching ASSET 1's style) contains Additional Subjects (ASSET 2+) and Elements (ASSET 3+), all performing the action "${actionPrompt}". NO MAIN SUBJECT is present.
    `;
  } else {
    const asset1 = "ASSET 1 (MAIN SUBJECT): Image 1. Use ONLY for this subject's **IDENTITY** (face, hair, outfit, accessories). Their **POSE** in this image is irrelevant and **MUST BE 100% IGNORED**.";
    const asset2 = "ASSET 2 (STYLE): Image 2. Use ONLY for AESTHETIC, VIBE, LIGHTING, and COLOR GRADE. **CRITICAL: IGNORE ALL CONTENT (people, objects, setting, location) from this image. ZERO CONTENT LEAK.** The scene's environment must be newly generated but *feel* like this image.";
    const asset3 = hasExtraChars ? `ASSET 3...${3 + additionalCharacterParts.length - 1} (ADDITIONAL SUBJECTS): Use these images ONLY for each additional subject's **IDENTITY** (face, outfit). Their **POSE** in this image is irrelevant and **MUST BE 100% IGNORED**.` : "";
    const asset4 = hasExtraElements ? `ASSET ${3 + additionalCharacterParts.length}... (ELEMENTS): Final images in set. Extract the key objects/elements from these images (e.g., 'a specific car', 'a snake') and integrate ONLY those elements into the scene. DO NOT copy the background or style from these images.` : "";

    if (isSubjectRemoved) {
      fullPrompt = `
        **ROLE:** AI Art Director (Component Mode, Subject Removed)
        **GOAL:** Create an empty environment shot with optional secondary elements.
        ${aspectRatioInstruction}
        **ASSETS:**
        * ${asset1}
        * ${asset2}
        * ${asset3}
        * ${asset4}
        **INSTRUCTIONS:**
      1.  **SHOT TYPE (PRIMARY):** Render this shot: "${shotType}".
      2.  **SUBJECT OMISSION (CRITICAL):** You MUST NOT include the MAIN SUBJECT from ASSET 1.
      3.  **ALL SUBJECTS (CRITICAL):** If ${hasExtraChars}, all ADDITIONAL SUBJECTS are defined by ASSET 3+. You MUST treat all of these as **HUMAN SUBJECTS** who will perform the action. **DO NOT** treat them as static objects.
      4.  **ENVIRONMENT & LIGHTING (CRITICAL):**
          * Create a NEW environment that matches the STYLE of ASSET 2 (vibe, lighting, color). ${backgroundInstruction}
          * **CRITICAL: DO NOT copy the location, setting, or any objects/people from ASSET 2.** ${environmentLockInstruction}
          * If ${hasExtraChars}, you **MUST** apply the lighting, shadows, and color grade from ASSET 2 *onto* all subjects. They must look naturally integrated and blended.
      5.  **ACTION (CRITICAL):** All subjects MUST perform this action: "${actionPrompt}".
      6.  **POSE (CRITICAL):** Pose is defined *only* by the ACTION: "${actionPrompt}". **DO NOT COPY THE POSE FROM ANY ASSET IMAGE (ASSET 3+). ALL POSES MUST BE NEWLY GENERATED.**
      7.  **ELEMENTS:** If ${hasExtraElements}, add all extracted ELEMENTS from ASSET 4+.
      8.  **CRITICAL ANATOMY:** If ${hasExtraChars}, you MUST ensure 100% correct human anatomy for all subjects. No malformed limbs or distorted faces. Double-check all limbs and hands.
      9.  **CRITICAL FACE CONSISTENCY:** All Additional Subjects' faces MUST be 100% consistent with their respective ASSET images (ASSET 3+).
        **SUMMARY:** Create a NEW ${aspectRatio} "${shotType}" image. A new environment (matching ASSET 2's style) contains Additional Subjects (ASSET 3+) and Elements (ASSET 4+), all performing the action "${actionPrompt}". The MAIN SUBJECT (ASSET 1) is NOT present.
      `;
    } else {
      fullPrompt = `
        **ROLE:** AI Art Director (Component Mode, Subject In)
        **GOAL:** Create a shot with subjects in a stylized environment.
        ${aspectRatioInstruction}
        **ASSETS:**
        * ${asset1}
        * ${asset2}
        * ${asset3}
        * ${asset4}
        **INSTRUCTIONS:**
        1.  **SHOT TYPE (PRIMARY):** Render this shot: "${shotType}".
        2.  **ALL SUBJECTS (CRITICAL):**
            * The MAIN SUBJECT is defined by ASSET 1 (face, outfit).
            * If ${hasExtraChars}, all ADDITIONAL SUBJECTS are defined by ASSET 3+ (face, outfit).
            * You MUST treat all of these as **HUMAN SUBJECTS** who will perform the action. **DO NOT** treat them as static objects.
        3.  **ACTION (CRITICAL):** All subjects MUST perform this action: "${actionPrompt}".
        4.  **POSE (CRITICAL):** Pose is defined *only* by the ACTION prompt: "${actionPrompt}". **DO NOT COPY THE POSE FROM ANY ASSET IMAGE (ASSET 1, ASSET 3+, etc.). ALL POSES MUST BE NEWLY GENERATED based on the action prompt.**
        5.  **ENVIRONMENT & LIGHTING (CRITICAL):**
            * Create a NEW environment that matches the STYLE of ASSET 2 (vibe, lighting, color). ${backgroundInstruction}
            * **CRITICAL: DO NOT copy the location, setting, or any objects/people from ASSET 2.** ${environmentLockInstruction}
            * You **MUST** apply the lighting, shadows, and color grade from ASSET 2 *onto* all subjects. They must look naturally integrated and blended into this new environment.
        6.  **ELEMENTS:** If ${hasExtraElements}, add all extracted ELEMENTS from ASSET 4+.
        7.  **CRITICAL ANATOMY:** You must ensure 100% correct human anatomy for all subjects. No malformed limbs, extra fingers, or distorted faces. This is a top priority. Double-check all limbs and hands.
        8.  **CRITICAL FACE CONSISTENCY:** The MAIN SUBJECT's face MUST be 100% consistent with ASSET 1. All ADDITIONAL SUBJECTS' faces MUST be 100% consistent with their respective ASSET images (ASSET 3+).
        **SUMMARY:** Create a NEW ${aspectRatio} "${shotType}" image. All Subjects (ASSET 1 + ASSET 3+) perform action "${actionPrompt}". NEW environment matches STYLE of ASSET 2. Add all Elements (ASSET 4+). All subjects are perfectly lit and blended. Perfect anatomy.
      `;
    }
  }

  const parts = [{ text: fullPrompt }];
  if (baseImagePart) {
    parts.push(baseImagePart);
  }
  if (styleImagePart && !isOverrideMode) {
    parts.push(styleImagePart);
  }
  parts.push(...additionalCharacterParts);
  parts.push(...elementImageParts);

  const payload = {
    contents: [{ parts: parts }],
    generationConfig: {
      responseModalities: ['IMAGE']
    },
  };

  try {
    const response = await fetchWithRetry(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    const candidate = result?.candidates?.[0];

    if (!candidate) {
      console.error("API response missing candidates:", result);
      throw new Error("Failed to generate image. The API returned an empty response.");
    }

    if (candidate.finishReason !== "STOP" && candidate.finishReason !== "MAX_TOKENS") {
      let errorMessage = "Image generation failed.";
      if (candidate.finishReason === "PROHIBITED_CONTENT") {
        errorMessage = "Image generation was blocked for safety reasons. Please try a different prompt or reference images.";
      } else if (candidate.finishMessage) {
        errorMessage = `Generation stopped: ${candidate.finishMessage}`;
      } else if (result.error) {
        errorMessage = result.error.message;
      }
      console.error("API Error:", result);
      throw new Error(errorMessage);
    }

    const base64Data = candidate?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

    if (base64Data) {
      return `data:image/png;base64,${base64Data}`;
    } else {
      console.error("API response missing image data but reported STOP:", result);
      throw new Error("Failed to generate image. The API response was invalid.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(error.message || "An unknown error occurred.");
  }
};
