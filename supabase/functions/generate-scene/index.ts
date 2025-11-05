import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateSceneRequest {
  actionPrompt: string;
  backgroundPrompt?: string;
  characterImage?: string;
  styleImage?: string;
  overrideImage?: string;
  additionalCharacters?: string[];
  elements?: string[];
  isSubjectRemoved?: boolean;
  isSceneLocked?: boolean;
  aspectRatio?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const requestData: GenerateSceneRequest = await req.json();
    const {
      actionPrompt,
      backgroundPrompt = "",
      characterImage,
      styleImage,
      overrideImage,
      additionalCharacters = [],
      elements = [],
      isSubjectRemoved = false,
      isSceneLocked = true,
      aspectRatio = "16:9 landscape"
    } = requestData;

    const imageParts: any[] = [];

    if (overrideImage) {
      imageParts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: overrideImage.split(",")[1]
        }
      });
    } else {
      if (characterImage) {
        imageParts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: characterImage.split(",")[1]
          }
        });
      }
      if (styleImage) {
        imageParts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: styleImage.split(",")[1]
          }
        });
      }
    }

    additionalCharacters.forEach((imgData) => {
      imageParts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imgData.split(",")[1]
        }
      });
    });

    elements.forEach((imgData) => {
      imageParts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imgData.split(",")[1]
        }
      });
    });

    let promptText = "";

    if (overrideImage) {
      promptText = `Generate a cinematic scene based on this reference image.\n\nACTION: ${actionPrompt}`;
      if (backgroundPrompt) {
        promptText += `\n\nBACKGROUND: ${backgroundPrompt}`;
      }
    } else {
      const hasCharacter = !!characterImage;
      const hasStyle = !!styleImage;

      if (hasCharacter && hasStyle) {
        if (isSubjectRemoved) {
          promptText = `Using the STYLE image's lighting, color grading, and mood (ignore any subjects in it), and REMOVING the subject from the CHARACTER image, generate a scene: ${actionPrompt}`;
        } else {
          promptText = `Using the CHARACTER from the first image and the STYLE (lighting, color, mood) from the second image, generate: ${actionPrompt}`;
        }
      } else if (hasCharacter) {
        promptText = `Using this CHARACTER, generate: ${actionPrompt}`;
      } else if (hasStyle) {
        promptText = `Using this STYLE reference, generate: ${actionPrompt}`;
      } else {
        promptText = actionPrompt;
      }

      if (backgroundPrompt) {
        promptText += `\n\nBackground environment: ${backgroundPrompt}`;
      }
    }

    if (additionalCharacters.length > 0) {
      promptText += `\n\nInclude these ${additionalCharacters.length} additional character(s) in the scene.`;
    }

    if (elements.length > 0) {
      promptText += `\n\nInclude these ${elements.length} element(s) in the scene.`;
    }

    promptText += `\n\nAspect ratio: ${aspectRatio}. Create a cinematic, high-quality image.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: promptText },
            ...imageParts
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              imageDescription: { type: "string" },
              imageGenerationPrompt: { type: "string" },
              shotType: { type: "string" }
            },
            required: ["imageDescription", "imageGenerationPrompt", "shotType"]
          }
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    const textContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error("No response from Gemini API");
    }

    const parsedResponse = JSON.parse(textContent);

    return new Response(
      JSON.stringify(parsedResponse),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error generating scene:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate scene" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});