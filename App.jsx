import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  Upload, Film, Wand2, Image as ImageIcon, Loader2, User, Palette, 
  AlertCircle, Download, X, PlusCircle, LayoutGrid, Expand,
  ToggleLeft, ToggleRight, Save, Library, ChevronsUpDown, Users, ImageUp,
  Lock, LockOpen, MapPin
} from 'lucide-react';

// --- API Configuration ---
// NOTE: An API key is not needed for this model in this environment.
// We leave it as "" and the environment will handle it.
const apiKey = ""; 
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;

// --- Constants ---
const SHOT_TYPES = [ // Updated 9-shot list inspired by user image
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
const SKELETON_STATE = Array(9).fill(null);

// --- Helper Functions ---

/**
 * Converts a File object to a base64 data URL.
 * @param {File} file The file to convert.
 * @returns {Promise<string>} A promise that resolves with the base64 string.
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * A wrapper for fetch that includes exponential backoff for retries.
 * @param {string} url The URL to fetch.
 * @param {object} options The fetch options.
 * @param {number} retries Number of retries.
 *_ @param {number} delay Initial delay in ms.
 * @returns {Promise<Response>}
 */
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

/**
 * Calls the Gemini API to generate a single image. (v19 - Stable Gen)
 */
const callGeminiAPI = async (
  actionPrompt, 
  backgroundPrompt, // New prompt for background
  baseImagePart, // Can be null for prompt-only
  styleImagePart, 
  shotType, 
  isSubjectRemoved, 
  additionalCharacterParts = [], 
  elementImageParts = [],
  isOverrideMode = false,
  isSceneLocked = true,
  aspectRatio = "16:9 landscape" // New
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

  // --- LOGIC FOR OVERRIDE MODE ---
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
  } 
  // --- LOGIC FOR STYLE-ONLY MODE (NO MAIN CHARACTER, BUT HAS STYLE IMAGE) ---
  else if (!baseImagePart) {
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
  }
  // --- LOGIC FOR COMPONENT MODE (DEFAULT: CHARACTER + STYLE) ---
  else {
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
  // Add baseImagePart ONLY if it exists (it's null in style-only mode)
  if (baseImagePart) {
    parts.push(baseImagePart); // Asset 1
  }
  // Add styleImagePart ONLY if it exists AND we are NOT in override mode
  if (styleImagePart && !isOverrideMode) {
    parts.push(styleImagePart); // Asset 2 (or 1 in style-only)
  }
  parts.push(...additionalCharacterParts); // Assets 3... (or 2... in style-only)
  parts.push(...elementImageParts); // Assets 4... (or 3... in style-only)
  
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

    // Check for API errors or safety blocks
    const candidate = result?.candidates?.[0];
    
    if (!candidate) {
      console.error("API response missing candidates:", result);
      throw new Error("Failed to generate image. The API returned an empty response.");
    }
    
    // Check for non-STOP finish reasons
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
      // This case means API reported STOP but sent no image
      console.error("API response missing image data but reported STOP:", result);
      throw new Error("Failed to generate image. The API response was invalid.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Re-throw the specific error message (either from our checks or fetch)
    throw new Error(error.message || "An unknown error occurred.");
  }
};

// --- NEO-BRUTALISM UI COMPONENTS ---

/**
 * Neo-Brutalism Image Dropzone
 */
const ImageDropzone = ({ title, preview, onFileChange, icon, aspectClass = "aspect-video", multiple = false, singleFile = false }) => {
  const handleFileChange = (e) => {
    if (multiple) {
      onFileChange(Array.from(e.target.files));
    } else {
      const file = e.target.files?.[0];
      if (file) {
        onFileChange(file);
      }
    }
  };
  const id = title.toLowerCase().replace(/[^a-z0-9]/g, '-');

  return (
    <div className="w-full">
      <label className="block text-sm font-bold text-black mb-2">{title}</label>
      <label
        htmlFor={id}
        className={`relative flex flex-col items-center justify-center w-full ${aspectClass} border-4 border-black border-dashed bg-white neo-shadow cursor-pointer group`}
      >
        {preview && !multiple ? (
          <>
            <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Upload className="w-8 h-8 text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-black">
            {icon}
            <p className="mt-2 text-sm font-bold text-center">
              {multiple ? "Click or drag to upload" : "Click or drag to upload"}
            </p>
            <p className="text-xs text-center">PNG, JPG, or WEBP</p>
          </div>
        )}
        <input 
          id={id} 
          type="file" 
          className="hidden" 
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange} 
          multiple={multiple}
        />
      </label>
    </div>
  );
};

/**
 * Skeleton placeholder for a loading shot.
 */
const ShotCardSkeleton = ({ ratioClass = "aspect-video" }) => (
  <div className={`${ratioClass} bg-gray-300 animate-pulse border-4 border-black`}></div>
);

/**
 * Card for a single generated shot.
 */
const ShotCard = ({ src, sceneNumber, shotNumber, onImageClick, ratioClass = "aspect-video" }) => {
  if (!src) {
    return <ShotCardSkeleton ratioClass={ratioClass} />;
  }

  return (
    <div className={`relative group ${ratioClass} bg-black border-4 border-black overflow-hidden shadow-lg`}>
      <img 
        src={src} 
        alt={`Scene ${sceneNumber} Shot ${shotNumber}`} 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
        <button
          onClick={() => onImageClick(src)}
          className="p-2 bg-yellow-400 rounded-full text-black border-4 border-black neo-shadow hover:neo-press-sm"
          aria-label="View shot"
        >
          <Expand className="w-5 h-5" />
        </button>
        <a 
          href={src} 
          download={`scene-${sceneNumber}-shot-${shotNumber}.png`}
          onClick={(e) => e.stopPropagation()}
          className="p-2 bg-yellow-400 rounded-full text-black border-4 border-black neo-shadow hover:neo-press-sm"
          aria-label="Download shot"
        >
          <Download className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
};

/**
 * Card for an entire Scene (9 shots).
 */
const SceneCard = ({ scene, sceneNumber, sceneIndex, onImageClick, onAddSceneAfter }) => {
  const sceneRef = useRef(null);

  useEffect(() => {
    if (scene.isNew && sceneRef.current) {
      sceneRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      scene.isNew = false; // Prevent re-scrolling
    }
  }, [scene.isNew]);
  
  const additionalCharacterPreviews = scene.additionalCharacterPreviews || [];
  const elementPreviews = scene.elementRefPreviews || [];
  const ratioClass = scene.aspectRatio === "9:16 portrait" ? "aspect-[9/16]" : "aspect-video";


  return (
    <section ref={sceneRef} className="bg-white border-4 border-black p-4 sm:p-6 neo-shadow">
      {/* Scene Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5 pb-5 border-b-4 border-black">
        <div>
          <h3 className="text-2xl font-bold text-black">Scene {sceneNumber}</h3>
          <p className="text-gray-700 italic mt-1">Action: "{scene.actionPrompt}"</p>
          {scene.backgroundPrompt && (
             <p className="text-gray-700 italic mt-1 text-sm">Setting: "{scene.backgroundPrompt}"</p>
          )}
          <div className="flex flex-wrap gap-2 items-center mt-2">
            {scene.isSubjectRemoved && (
              <span className="inline-block bg-red-400 border-4 border-black px-3 py-1 text-xs font-bold neo-shadow">
                MAIN SUBJECT REMOVED
              </span>
            )}
            {scene.isOverrideMode && (
              <span className="inline-block bg-purple-400 border-4 border-black px-3 py-1 text-xs font-bold neo-shadow">
                OVERRIDE MODE
              </span>
            )}
            {!scene.baseRefPreview.includes("PROMPT-ONLY") && !scene.baseRefPreview.includes("STYLE-ONLY") && scene.isSceneLocked && (
              <span className="inline-block bg-green-400 border-4 border-black px-3 py-1 text-xs font-bold neo-shadow">
                SCENE LOCKED
              </span>
            )}
            {scene.baseRefPreview.includes("PROMPT-ONLY") && (
               <span className="inline-block bg-gray-400 border-4 border-black px-3 py-1 text-xs font-bold neo-shadow">
                PROMPT-ONLY
              </span>
            )}
             {scene.baseRefPreview.includes("STYLE-ONLY") && (
               <span className="inline-block bg-blue-400 border-4 border-black px-3 py-1 text-xs font-bold neo-shadow">
                STYLE-ONLY
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {!scene.baseRefPreview.includes("PROMPT-ONLY") && !scene.baseRefPreview.includes("STYLE-ONLY") && (
            <div className="text-left">
              <span className="block text-xs font-bold text-black mb-1">
                {scene.isOverrideMode ? "Source" : "Character"}
              </span>
              <img src={scene.baseRefPreview} alt={scene.isOverrideMode ? "Source Ref" : "Base Ref"} className="w-14 h-14 object-cover border-4 border-black" />
            </div>
          )}
          {scene.styleRefPreview && !scene.styleRefPreview.includes("NO-STYLE") && (
            <div className="text-left">
              <span className="block text-xs font-bold text-black mb-1">Style</span>
              <img src={scene.styleRefPreview} alt="Location / Style Ref" className="w-14 h-14 object-cover border-4 border-black" />
            </div>
          )}
          {additionalCharacterPreviews.length > 0 && (
            <div className="text-left">
              <span className="block text-xs font-bold text-black mb-1">Add. Chars</span>
              <div className="flex gap-1">
                {additionalCharacterPreviews.map((src, i) => (
                  <img key={i} src={src} alt={`Char ${i+1}`} className="w-7 h-14 object-cover border-2 border-black" />
                ))}
              </div>
            </div>
          )}
          {elementPreviews.length > 0 && (
            <div className="text-left">
              <span className="block text-xs font-bold text-black mb-1">Elements</span>
              <div className="flex gap-1">
                {elementPreviews.map((src, i) => (
                  <img key={i} src={src} alt={`Element ${i+1}`} className="w-7 h-14 object-cover border-2 border-black" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Shots Grid (3x3) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {scene.generatedShots.map((src, index) => (
          <ShotCard 
            key={index}
            src={src}
            sceneNumber={sceneNumber}
            shotNumber={index + 1}
            onImageClick={onImageClick}
            ratioClass={ratioClass}
          />
        ))}
      </div>

      {/* Add Scene Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => onAddSceneAfter(sceneIndex)}
          className="neo-button bg-blue-400 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add Scene Below
        </button>
      </div>
    </section>
  );
};

/**
 * Main "Control Panel" Sidebar
 */
const Sidebar = ({
  onCharacterUpload, characterPreview,
  onStyleUpload, stylePreview,
  onSubmit, isLoading, currentGeneratingText,
  sceneCount, insertIndex, setInsertIndex, error,
  savedCharacters, onSaveCharacter, onSelectCharacter,
  selectedActorId,
  aspectRatio, // New
  setAspectRatio // New
}) => {
  const [actionPrompt, setActionPrompt] = useState(""); // Renamed from prompt
  const [backgroundPrompt, setBackgroundPrompt] = useState(""); // New state
  
  // Refactored State: Use objects to store file and preview together
  const [override, setOverride] = useState({ file: null, preview: null });
  const [additionalCharacters, setAdditionalCharacters] = useState([]); // [{ id, file, preview }]
  const [elements, setElements] = useState([]); // [{ id, file, preview }]
  
  const [isSubjectRemoved, setIsSubjectRemoved] = useState(false);
  const [isSceneLocked, setIsSceneLocked] = useState(true); // New Setting
  const [characterNameInput, setCharacterNameInput] = useState("");
  const [isAutoSelectedActor, setIsAutoSelectedActor] = useState(false); // New state for auto-selection logic
  
  // --- New State for Multi-Actor Auto-Selection ---
  const [autoSelectedAddlChars, setAutoSelectedAddlChars] = useState([]);
  const [isAutoSelectedAddl, setIsAutoSelectedAddl] = useState(false);
  
  const inputRef = useRef(null);

  useEffect(() => {
    if (insertIndex !== null) {
      inputRef.current?.focus(); // Focus action prompt on insert
    }
  }, [insertIndex]);

  // --- Updated useEffect for Actor Auto-Selection (Main + Additional) ---
  useEffect(() => {
    // Don't run this logic if user is in override mode
    if (override.file) {
      if (isAutoSelectedActor) {
        onSelectCharacter("");
        setIsAutoSelectedActor(false);
      }
      if (isAutoSelectedAddl) {
        setAutoSelectedAddlChars([]);
        setIsAutoSelectedAddl(false);
      }
      return;
    }

    // Don't run if user has manually uploaded addl chars
    if (additionalCharacters.length > 0) {
      return;
    }

    if (!actionPrompt) {
      if (isAutoSelectedActor) {
        onSelectCharacter("");
        setIsAutoSelectedActor(false);
      }
      if (isAutoSelectedAddl) {
        setAutoSelectedAddlChars([]);
        setIsAutoSelectedAddl(false);
      }
      return;
    }

    const sortedCharacters = [...savedCharacters].sort((a, b) => b.name.length - a.name.length);
    const foundActors = [];
    let tempPrompt = actionPrompt.toLowerCase();

    for (const actor of sortedCharacters) {
      if (tempPrompt.includes(actor.name.toLowerCase())) {
        foundActors.push(actor);
        tempPrompt = tempPrompt.replace(actor.name.toLowerCase(), ""); // Avoid re-matching "Drake" from "Drake Bell"
      }
    }

    const mainActor = foundActors[0] || null;
    const addlActors = foundActors.slice(1);

    // Handle Main Actor
    if (mainActor) {
      if (mainActor.id !== selectedActorId) {
        onSelectCharacter(mainActor.id);
        setIsAutoSelectedActor(true); // Mark as auto-selected
      }
    } else {
      // No actor found in prompt
      if (isAutoSelectedActor) { // And we had auto-selected someone
        onSelectCharacter(""); // Clear the selection
        setIsAutoSelectedActor(false);
      }
    }
    
    // Handle Additional Actors
    const newAddlActorIds = addlActors.map(a => a.id).sort().join(',');
    const currentAddlActorIds = autoSelectedAddlChars.map(a => a.id).sort().join(',');

    if (newAddlActorIds !== currentAddlActorIds) {
        setAutoSelectedAddlChars(addlActors);
        setIsAutoSelectedAddl(true); // Mark as auto-selected
    }
    
    // If no actors found, clear addl actors
    if (foundActors.length === 0 && isAutoSelectedAddl) {
      setAutoSelectedAddlChars([]);
      setIsAutoSelectedAddl(false);
    }
  
  // Dependencies:
  }, [actionPrompt, savedCharacters, selectedActorId, onSelectCharacter, isAutoSelectedActor, override.file, additionalCharacters.length, autoSelectedAddlChars, isAutoSelectedAddl]);


  const handleOverrideChange = async (file) => {
    if (file) {
      const preview = await fileToBase64(file);
      setOverride({ file, preview });
    } else {
      setOverride({ file: null, preview: null });
    }
  };

  const clearOverride = () => {
    setOverride({ file: null, preview: null });
  };

  const handleAdditionalCharacterChange = async (files) => {
    setIsAutoSelectedAddl(false); // Manual upload overrides auto-selection
    setAutoSelectedAddlChars([]);
    const newChars = await Promise.all(files.map(async (file) => {
      const preview = await fileToBase64(file);
      return { id: crypto.randomUUID(), file, preview };
    }));
    setAdditionalCharacters(newChars);
  };

  const clearAdditionalCharacters = () => {
    setAdditionalCharacters([]);
    setAutoSelectedAddlChars([]);
    setIsAutoSelectedAddl(false);
  };

  const handleElementChange = async (files) => {
    const newElements = await Promise.all(files.map(async (file) => {
      const preview = await fileToBase64(file);
      return { id: crypto.randomUUID(), file, preview };
    }));
    setElements(newElements);
  };

  const clearElements = () => {
    setElements([]);
  };
  
  const handleSaveClick = () => {
    if (characterNameInput && characterPreview) {
      onSaveCharacter(characterNameInput);
      setCharacterNameInput("");
    }
  };
  
  // Updated to track manual vs. auto selection
  const handleSelectActor = (e) => {
    const actorId = e.target.value;
    onSelectCharacter(actorId);
    setIsAutoSelectedActor(false); // User manually selected
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!actionPrompt || isLoading) return; // Action prompt is always required
    // Must have either Style (Step 2) OR an Override image
    if (!override.file && !stylePreview) return;
    
    // Character mode without style is the only invalid state (besides loading/no prompt)
    const isCharacterModeWithoutStyle = !override.file && !stylePreview && !!characterPreview;
    if (isCharacterModeWithoutStyle) return;

    // --- Combine manual and auto-selected additional characters ---
    const allAdditionalCharFiles = (isAutoSelectedAddl ? autoSelectedAddlChars : additionalCharacters).map(c => c.file);

    onSubmit(
      actionPrompt, 
      backgroundPrompt, 
      insertIndex, 
      override.file, // Pass the file
      allAdditionalCharFiles, // Pass COMBINED files
      elements.map(e => e.file), // Pass just the files
      isSubjectRemoved, 
      isSceneLocked,
      aspectRatio // Pass new value
    );
    
    setActionPrompt("");
    setBackgroundPrompt(""); // Clear background prompt too
    clearOverride();
    clearAdditionalCharacters();
    clearElements();
    setInsertIndex(null); // Reset insert index after submit
  };
  
  let title = "Create Scene";
  let generateButtonText = `Generate Scene ${sceneCount + 1}`;
  if (insertIndex !== null) {
    title = `Insert Scene`;
    generateButtonText = `Insert After Scene ${insertIndex}`;
  }

  const generateProgressText = isLoading ? currentGeneratingText : generateButtonText;
  const isComponentModeDisabled = !!override.file;
  const isOverrideModeDisabled = !!stylePreview; // Can't use Override if Style is set
  
  // Check for the one invalid state: Character loaded, but no Style and no Override
  const isCharacterModeWithoutStyle = !override.file && !stylePreview && !!characterPreview;
  
  // --- Combine character lists for UI rendering ---
  const allAdditionalCharacters = isAutoSelectedAddl ? autoSelectedAddlChars : additionalCharacters;

  return (
    <aside className="w-full md:w-96 lg:w-[400px] bg-white border-r-4 border-black flex-shrink-0">
      <div className="h-screen sticky top-0 overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* --- Component Mode --- */}
          <fieldset className={`space-y-4 ${isComponentModeDisabled ? 'opacity-50' : ''}`}>
            <legend className="text-xs font-bold text-gray-700 uppercase">Component Mode</legend>
            
            {/* --- Step 1: Main Character (Optional) --- */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6 text-black" />
                <h2 className="text-xl font-bold text-black">Step 1: Main Character <span className="text-base font-normal">(Optional)</span></h2>
              </div>
              <div className="space-y-2">
                <label htmlFor="actor-library" className="block text-sm font-bold text-black">
                  Actor Library
                </label>
                <div className="relative">
                  <Library className="w-5 h-5 text-black absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select 
                    id="actor-library" 
                    value={selectedActorId}
                    onChange={handleSelectActor}
                    className="w-full p-3 pl-10 bg-white border-4 border-black neo-shadow focus:outline-none focus:bg-yellow-100 appearance-none"
                    disabled={isComponentModeDisabled}
                  >
                    <option value="">Select a saved actor...</option>
                    {savedCharacters.map(actor => (
                      <option key={actor.id} value={actor.id}>
                        {actor.name}
                      </option>
                    ))}
                  </select>
                  <ChevronsUpDown className="w-5 h-5 text-black absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <ImageDropzone 
                title="Upload New Character"
                preview={characterPreview}
                onFileChange={onCharacterUpload}
                icon={<User className="w-10 h-10" />}
                aspectClass="aspect-square"
                disabled={isComponentModeDisabled}
              />
              {characterPreview && (
                <div className="space-y-2">
                  <label htmlFor="actor-name" className="block text-sm font-bold text-black">
                    Save Current Actor
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="actor-name"
                      placeholder="Enter actor's name..."
                      value={characterNameInput}
                      onChange={(e) => setCharacterNameInput(e.target.value)}
                      className="w-full p-3 bg-white border-4 border-black neo-shadow placeholder-gray-500 focus:outline-none focus:bg-yellow-100"
                      disabled={isComponentModeDisabled}
                    />
                    <button
                      type="button"
                      onClick={handleSaveClick}
                      disabled={!characterNameInput || isComponentModeDisabled}
                      className="neo-button bg-blue-400 p-3 flex-shrink-0 disabled:bg-gray-400 disabled:neo-shadow-disabled disabled:neo-press-disabled"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* --- Step 2: Style (Required for this mode) --- */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Palette className="w-6 h-6 text-black" />
                <h2 className="text-xl font-bold text-black">Step 2: Style & Vibe</h2>
              </div>
              <ImageDropzone 
                title="Aesthetic / Vibe Reference"
                preview={stylePreview}
                onFileChange={onStyleUpload}
                icon={<Palette className="w-10 h-10" />}
                aspectClass="aspect-video"
                disabled={isComponentModeDisabled}
              />
            </div>
          </fieldset>

          <div className="relative flex items-center">
            <hr className="border-t-4 border-black w-full" />
            <span className="absolute left-1/2 -translate-x-1/2 bg-white px-2 font-bold text-gray-700">OR</span>
          </div>

          {/* --- Override Mode --- */}
          <fieldset className={`space-y-4 ${!isComponentModeDisabled ? 'opacity-50' : ''}`}>
            <legend className="text-xs font-bold text-gray-700 uppercase">Override Mode</legend>
            <div className="relative">
              <ImageDropzone
                title="Override Scene with Single Image"
                preview={override.preview}
                onFileChange={handleOverrideChange}
                icon={<ImageUp className="w-10 h-10" />}
                aspectClass="aspect-video"
                disabled={isOverrideModeDisabled}
              />
              {override.preview && (
                <button
                  type="button"
                  onClick={clearOverride}
                  className="absolute top-9 right-2 p-1 bg-black/80 rounded-full text-white hover:bg-black"
                  aria-label="Clear override image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </fieldset>
          

          <hr className="border-t-4 border-black" />

          {/* --- Step 3: Generator Form --- */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Wand2 className="w-6 h-6 text-black" />
              <h2 className="text-xl font-bold text-black">{title}</h2>
            </div>
            
            {insertIndex !== null && (
              <div className="p-3 bg-blue-400 border-4 border-black text-black neo-shadow flex items-center justify-between gap-2">
                <span className="font-bold text-sm">Inserting after Scene {insertIndex}</span>
                <button
                  type="button"
                  onClick={() => setInsertIndex(null)}
                  className="font-bold text-sm hover:underline"
                >
                  [Cancel]
                </button>
              </div>
            )}
            
            {/* Action Prompt */}
            <div className="space-y-2">
              <label htmlFor="action-prompt" className="block text-sm font-bold text-black">
                Subject(s) Action Prompt
              </label>
              <textarea
                id="action-prompt"
                rows="3"
                value={actionPrompt}
                onChange={(e) => setActionPrompt(e.target.value)}
                placeholder="e.g., Drake singing, Bully and Guru Gomke fighting..."
                className="w-full p-3 bg-white border-4 border-black neo-shadow placeholder-gray-500 focus:outline-none focus:bg-yellow-100"
                ref={inputRef}
              />
            </div>
            
            {/* Background Prompt */}
            <div className="space-y-2">
              <label htmlFor="background-prompt" className="block text-sm font-bold text-black">
                Scene Setting / Background Prompt (Optional)
              </label>
              <textarea
                id="background-prompt"
                rows="3"
                value={backgroundPrompt}
                onChange={(e) => setBackgroundPrompt(e.target.value)}
                placeholder="e.g., A bustling city street at night, rainy forest..."
                className="w-full p-3 bg-white border-4 border-black neo-shadow placeholder-gray-500 focus:outline-none focus:bg-yellow-100"
              />
            </div>

            {/* Additional Characters */}
            <div className={`relative ${isComponentModeDisabled ? 'opacity-50' : ''}`}>
              <ImageDropzone
                title={isAutoSelectedAddl ? `Additional Characters (Auto: ${allAdditionalCharacters.length})` : "Additional Characters (Optional)"}
                onFileChange={handleAdditionalCharacterChange}
                icon={<Users className="w-6 h-6" />}
                aspectClass="aspect-[4/1]"
                multiple={true}
                disabled={isComponentModeDisabled}
              />
              {allAdditionalCharacters.length > 0 && (
                <button
                  type="button"
                  onClick={clearAdditionalCharacters}
                  className="absolute top-9 right-2 p-1 bg-black/80 rounded-full text-white hover:bg-black"
                  aria-label="Clear all characters"
                  disabled={isComponentModeDisabled}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {allAdditionalCharacters.length > 0 && !isComponentModeDisabled && (
              <div className="flex gap-2 overflow-x-auto p-2 bg-gray-100 border-2 border-black">
                {allAdditionalCharacters.map((item) => (
                  <img key={item.id} src={item.preview} alt={item.name || 'Char'} title={item.name || 'Char'} className="w-16 h-16 object-cover border-2 border-black flex-shrink-0" />
                ))}
              </div>
            )}

            {/* Additional Elements */}
            <div className={`relative ${isComponentModeDisabled ? 'opacity-50' : ''}`}>
              <ImageDropzone
                title="Additional Reference Elements (Optional)"
                onFileChange={handleElementChange}
                icon={<ImageIcon className="w-6 h-6" />}
                aspectClass="aspect-[4/1]"
                multiple={true}
                disabled={isComponentModeDisabled}
              />
              {elements.length > 0 && (
                <button
                  type="button"
                  onClick={clearElements}
                  className="absolute top-9 right-2 p-1 bg-black/80 rounded-full text-white hover:bg-black"
                  aria-label="Clear all elements"
                  disabled={isComponentModeDisabled}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {elements.length > 0 && !isComponentModeDisabled && (
              <div className="flex gap-2 overflow-x-auto p-2 bg-gray-100 border-2 border-black">
                {elements.map((item) => (
                  <img key={item.id} src={item.preview} alt={`Element`} className="w-16 h-16 object-cover border-2 border-black flex-shrink-0" />
))}
              </div>
            )}

            {/* --- Settings Toggles --- */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-black flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Aspect Ratio
                </label>
                <div className="flex border-4 border-black neo-shadow overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setAspectRatio("16:9 landscape")}
                    className={`p-2 px-4 font-bold ${aspectRatio.includes("landscape") ? 'bg-yellow-400' : 'bg-white'} hover:bg-yellow-200`}
                  >
                    16:9
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio("9:16 portrait")}
                    className={`p-2 px-4 font-bold border-l-4 border-black ${aspectRatio.includes("portrait") ? 'bg-yellow-400' : 'bg-white'} hover:bg-yellow-200`}
                  >
                    9:16
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="remove-subject" className="text-sm font-bold text-black flex items-center gap-2">
                  <User className="w-4 h-4" /> Remove Main Subject
                </label>
                <button
                  type="button"
                  id="remove-subject"
                  role="switch"
                  aria-checked={isSubjectRemoved}
                  onClick={() => setIsSubjectRemoved(!isSubjectRemoved)}
                  className="flex-shrink-0"
                  disabled={!characterPreview && !override.file} // Disable if no character is loaded
                >
                  {isSubjectRemoved ? (
                    <ToggleRight className="w-10 h-10 text-red-500" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-500" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="lock-scene" className="text-sm font-bold text-black flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Enforce Scene Consistency
                </label>
                <button
                  type="button"
                  id="lock-scene"
                  role="switch"
                  aria-checked={isSceneLocked}
                  onClick={() => setIsSceneLocked(!isSceneLocked)}
                  className="flex-shrink-0"
                >
                  {isSceneLocked ? (
                    <ToggleRight className="w-10 h-10 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            
            <ErrorDisplay error={error} />
            
            <button
              type="submit"
              disabled={!actionPrompt || isLoading || isCharacterModeWithoutStyle}
              className="neo-button bg-yellow-400 w-full flex items-center justify-center disabled:bg-gray-400 disabled:neo-shadow-disabled disabled:neo-press-disabled"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {generateProgressText}
                </>
              ) : (
                generateButtonText
              )}
            </button>
            {isCharacterModeWithoutStyle && (
              <p className="text-sm text-center font-bold text-red-600">
                Style image (Step 2) is required when using a Main Character.
              </p>
            )}
            {!actionPrompt && (stylePreview || override.file || !isCharacterModeWithoutStyle) && (
                 <p className="text-sm text-center font-bold text-red-600">
                   Action Prompt is required.
                 </p>
            )}
          </div>
        </form>
      </div>
    </aside>
  );
};

/**
 * Main "Canvas" for the Storyboard
 */
const StoryboardCanvas = ({ scenes, onImageClick, onAddSceneAfter }) => {
  return (
    <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto">
      {scenes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-black text-center">
          <LayoutGrid className="w-24 h-24 mb-6" />
          <h3 className="text-2xl font-bold">Your Storyboard is Empty</h3>
          <p className="mt-2 max-w-sm">
            Complete the form in the control panel to generate your first scene.
          </p>
        </div>
      ) : (
        <div className="space-y-8 max-w-6xl mx-auto">
          {scenes.map((scene, index) => (
            <SceneCard 
              key={scene.id} 
              scene={scene} 
              sceneNumber={index + 1} 
              sceneIndex={index}
              onImageClick={onImageClick}
              onAddSceneAfter={onAddSceneAfter}
            />
          ))}
        </div>
      )}
    </main>
  );
};

/**
 * Component to display error messages.
 */
const ErrorDisplay = ({ error }) => {
  if (!error) return null;
  return (
    <div className="p-3 bg-red-400 border-4 border-black text-black neo-shadow flex items-center space-x-3">
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <div>
        <span className="font-bold">Generation Failed:</span> {error}
      </div>
    </div>
  );
};

/**
 * Modal component to view an image.
 */
const Modal = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl max-h-[90vh] bg-white border-4 border-black neo-shadow"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={src} alt="Enlarged shot" className="block w-full h-auto object-contain max-h-[90vh]" />
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 p-1 bg-yellow-400 rounded-full text-black border-4 border-black neo-shadow hover:neo-press-sm"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};


/**
 * Main Application Component.
 */
export default function App() {
  // --- Refactored State ---
  const [character, setCharacter] = useState({ file: null, preview: null });
  const [style, setStyle] = useState({ file: null, preview: null });
  
  const [selectedActorId, setSelectedActorId] = useState("");
  const [savedCharacters, setSavedCharacters] = useState([]); // [{id, name, file, preview}]
  
  const [scenes, setScenes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentGeneratingText, setCurrentGeneratingText] = useState("");
  const [error, setError] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  const [insertIndex, setInsertIndex] = useState(null); // null = add to end, number = insert after index
  const [aspectRatio, setAspectRatio] = useState("16:9 landscape"); // New
  
  // --- Memoized Image Parts ---
  // Using useCallback for imagePart to correctly capture dependencies
  const imageToApiPart = useCallback(async (file) => {
    if (!file) return null;
    const base64Data = await fileToBase64(file);
    return {
      inlineData: {
        mimeType: file.type,
        data: base64Data.split(',')[1]
      }
    };
  }, []);

  // --- Handlers ---
  const handleGenerate = useCallback(async (actionPrompt, backgroundPrompt, insertIndex, overrideFile, additionalCharacterFiles, elementFiles, isSubjectRemoved, isSceneLocked, aspectRatio) => { // Added aspectRatio
    setIsLoading(true);
    setError(null);
    setCurrentGeneratingText("Starting...");
    
    const newSceneId = crypto.randomUUID();
    let initialScene;
    let isOverrideMode = false;
    
    try {
      let activeBasePart, activeStylePart;
      let activeBasePreview, activeStylePreview;
      let additionalCharacterParts = [], additionalCharacterPreviews = [];
      let elementParts = [], elementPreviews = [];

      if (overrideFile) {
        // --- OVERRIDE MODE ---
        isOverrideMode = true;
        activeBasePart = await imageToApiPart(overrideFile);
        activeStylePart = activeBasePart; // Use the same image for both
        activeBasePreview = await fileToBase64(overrideFile);
        activeStylePreview = "https://placehold.co/256x256/333/FFF?text=NO-STYLE"; // <-- FIX: Set to NO-STYLE for UI
        // In override mode, we ignore additional chars/elements
      } else {
        // --- COMPONENT MODE ---
        isOverrideMode = false;

        // UI validation ensures style.file MUST exist here if overrideFile doesn't.
        if (!style.file) {
           throw new Error("Style image (Step 2) is required for Component Mode.");
        }
        activeStylePart = await imageToApiPart(style.file);
        activeStylePreview = style.preview;
        
        if (character.file) {
          // 1. Character Mode: (Character + Style)
          activeBasePart = await imageToApiPart(character.file);
          activeBasePreview = character.preview;
        } else {
          // 2. Style-Only Mode: (No Character + Style)
          activeBasePart = null; // No main character
          activeBasePreview = "https://placehold.co/256x256/333/FFF?text=STYLE-ONLY"; // New placeholder
        }
        
        // 3. Prepare Additional Character Parts (Now passed in from Sidebar logic)
        additionalCharacterParts = await Promise.all(additionalCharacterFiles.map(imageToApiPart));
        additionalCharacterPreviews = await Promise.all(additionalCharacterFiles.map(fileToBase64));
        
        // 4. Prepare Additional Element Parts
        elementParts = await Promise.all(elementFiles.map(imageToApiPart));
        elementPreviews = await Promise.all(elementFiles.map(fileToBase64));
      }
      
      initialScene = {
        id: newSceneId,
        actionPrompt: actionPrompt,
        backgroundPrompt: backgroundPrompt,
        generatedShots: SKELETON_STATE, // 9 shots
        isNew: true,
        styleRefPreview: activeStylePreview,
        baseRefPreview: activeBasePreview,
        additionalCharacterPreviews: additionalCharacterPreviews, // Store previews for the card
        elementRefPreviews: elementPreviews,
        isSubjectRemoved: isSubjectRemoved,
        isOverrideMode: isOverrideMode,
        isSceneLocked: isSceneLocked,
        aspectRatio: aspectRatio // Store aspect ratio
      };

      // Add or insert the initial scene structure
      setScenes(prevScenes => {
        const updatedScenes = [...prevScenes];
        if (insertIndex !== null) {
          updatedScenes.splice(insertIndex, 0, initialScene);
        } else {
          updatedScenes.push(initialScene);
        }
        return updatedScenes;
      });

      // --- STABLE GENERATION LOOP ---
      const generatedShots = [];
      for (let i = 0; i < SHOT_TYPES.length; i++) {
        setCurrentGeneratingText(`Generating ${i + 1}/${SHOT_TYPES.length}: ${SHOT_TYPES[i]}...`);
        const shotSrc = await callGeminiAPI(
          actionPrompt, 
          backgroundPrompt,
          activeBasePart, 
          activeStylePart, 
          SHOT_TYPES[i], 
          isSubjectRemoved, 
          additionalCharacterParts,
          elementParts,
          isOverrideMode,
          isSceneLocked,
          aspectRatio // Pass aspect ratio
        );
        generatedShots.push(shotSrc);
      }

      // --- UPDATE STATE ONCE ---
      // After all images are generated, update the scene with the full array
      setScenes(prevScenes => prevScenes.map(scene => 
        scene.id === newSceneId 
          ? { ...scene, generatedShots: generatedShots }
          : scene
      ));

    } catch (err) {
      console.error("Generation failed:", err);
      setError(err.message || "An unknown error occurred during generation.");
      // Remove the partially generated scene on failure
      setScenes(prevScenes => prevScenes.filter(s => s.id !== newSceneId));
    } finally {
      setIsLoading(false);
      setCurrentGeneratingText("");
      setInsertIndex(null); // Always reset after generation
    }
  }, [character, style, imageToApiPart]); // Simplified dependencies

  const handleRequestAddSceneAfter = (index) => {
    setInsertIndex(index + 1); // Set index to insert *after*
    // Scroll to top of sidebar
    const sidebar = document.querySelector('aside > div');
    if (sidebar) {
      sidebar.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Focus the prompt input
    const promptInput = document.getElementById('action-prompt'); // Focus action prompt
    if (promptInput) {
      promptInput.focus();
    }
  };
  
  const handleCharacterUpload = async (file) => {
    if (file) {
      const preview = await fileToBase64(file);
      setCharacter({ file, preview });
      setSelectedActorId(""); // Deselect from library on new upload
    }
  };
  
  const handleStyleUpload = async (file) => {
    if (file) {
      const preview = await fileToBase64(file);
      setStyle({ file, preview });
    }
  };
  
  const handleSaveCharacter = (name) => {
    if (!character.file || !character.preview || !name) return;
    
    // Check if name already exists
    if (savedCharacters.some(actor => actor.name === name)) {
      setError("An actor with this name already exists.");
      return;
    }
    setError(null);

    const newActor = {
      id: crypto.randomUUID(),
      name: name,
      file: character.file,
      preview: character.preview
    };
    
    setSavedCharacters(prev => [...prev, newActor]);
    setSelectedActorId(newActor.id); // Auto-select newly saved actor
  };
  
  const handleSelectCharacter = (actorId) => {
    setSelectedActorId(actorId); // Track selected ID
    if (!actorId) {
      setCharacter({ file: null, preview: null });
      return;
    }
    
    const actor = savedCharacters.find(a => a.id === actorId);
    if (actor) {
      setCharacter({ file: actor.file, preview: actor.preview });
    }
  };

  return (
    <>
      {/* Custom Styles for Neo-Brutalism */}
      <style>{`
        .neo-shadow {
          box-shadow: 4px 4px 0px #000;
        }
        .neo-shadow-disabled {
          box-shadow: none;
        }
        .neo-button {
          padding: 0.75rem 1.5rem;
          font-weight: 700;
          color: black;
          border: 4px solid black;
          box-shadow: 4px 4px 0px #000;
          transition: all 0.1s ease-in-out;
        }
        .neo-button:hover:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px #000;
        }
        .neo-button:active:not(:disabled) {
          transform: translate(4px, 4px);
          box-shadow: 0px 0px 0px #000;
        }
        .neo-button:disabled {
          transform: none;
          box-shadow: none;
        }
        .hover\\:neo-press-sm:hover:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px #000;
        }
      `}</style>
      
      <div className="min-h-screen bg-blue-200 text-black font-sans flex flex-col md:flex-row">
        {/* Header for Mobile */}
        <header className="py-4 px-4 bg-white border-b-4 border-black flex md:hidden items-center justify-center space-x-3 sticky top-0 z-20">
          <Film className="w-6 h-6 text-black" />
          <h1 className="text-xl font-bold">
            Music Video Shot Generator
          </h1>
        </header>
        
        <Sidebar
          onCharacterUpload={handleCharacterUpload}
          characterPreview={character.preview}
          onStyleUpload={handleStyleUpload}
          stylePreview={style.preview}
          onSubmit={handleGenerate}
          isLoading={isLoading}
          currentGeneratingText={currentGeneratingText}
          sceneCount={scenes.length}
          insertIndex={insertIndex}
          setInsertIndex={setInsertIndex}
          error={error}
          savedCharacters={savedCharacters}
          onSaveCharacter={handleSaveCharacter}
          onSelectCharacter={handleSelectCharacter}
          selectedActorId={selectedActorId}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
        />
        
        <StoryboardCanvas 
          scenes={scenes}
          onImageClick={setViewingImage}
          onAddSceneAfter={handleRequestAddSceneAfter}
        />
        
        <Modal src={viewingImage} onClose={() => setViewingImage(null)} />
      </div>
    </>
  );
}
