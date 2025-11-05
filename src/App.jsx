import { useState, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import SetupPage from './components/SetupPage';
import Step3CreateScene from './components/Step3CreateScene';
import StoryboardView from './components/StoryboardView';
import Modal from './components/Modal';
import { callGeminiAPI, fileToBase64, imageToApiPart, SHOT_TYPES, SKELETON_STATE } from './utils/api';

const STEPS = {
  LANDING: 'landing',
  SETUP: 'setup',
  SCENE: 'scene',
  STORYBOARD: 'storyboard'
};

export default function App() {
  const [currentStep, setCurrentStep] = useState(STEPS.LANDING);
  const [character, setCharacter] = useState({ file: null, preview: null });
  const [style, setStyle] = useState({ file: null, preview: null });
  const [override, setOverride] = useState({ file: null, preview: null });
  const [selectedActorId, setSelectedActorId] = useState("");
  const [savedCharacters, setSavedCharacters] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentGeneratingText, setCurrentGeneratingText] = useState("");
  const [error, setError] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);

  const handleCharacterUpload = async (file) => {
    if (file) {
      const preview = await fileToBase64(file);
      setCharacter({ file, preview });
      setSelectedActorId("");
    }
  };

  const handleStyleUpload = async (file) => {
    if (file) {
      const preview = await fileToBase64(file);
      setStyle({ file, preview });
    }
  };

  const handleOverrideChange = async (file) => {
    if (file) {
      const preview = await fileToBase64(file);
      setOverride({ file, preview });
      setStyle({ file: null, preview: null });
    } else {
      setOverride({ file: null, preview: null });
    }
  };

  const handleClearOverride = () => {
    setOverride({ file: null, preview: null });
  };

  const handleSaveCharacter = (name) => {
    if (!character.file || !character.preview || !name) return;

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
    setSelectedActorId(newActor.id);
  };

  const handleSelectCharacter = (actorId) => {
    setSelectedActorId(actorId);
    if (!actorId) {
      setCharacter({ file: null, preview: null });
      return;
    }

    const actor = savedCharacters.find(a => a.id === actorId);
    if (actor) {
      setCharacter({ file: actor.file, preview: actor.preview });
    }
  };

  const handleGenerate = useCallback(async (
    actionPrompt,
    backgroundPrompt,
    additionalCharacterFiles,
    elementFiles,
    isSubjectRemoved,
    isSceneLocked,
    aspectRatio
  ) => {
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

      if (override.file) {
        isOverrideMode = true;
        activeBasePart = await imageToApiPart(override.file);
        activeStylePart = activeBasePart;
        activeBasePreview = override.preview;
        activeStylePreview = "https://placehold.co/256x256/333/FFF?text=NO-STYLE";
      } else {
        isOverrideMode = false;

        if (!style.file) {
          throw new Error("Style image is required for Component Mode.");
        }
        activeStylePart = await imageToApiPart(style.file);
        activeStylePreview = style.preview;

        if (character.file) {
          activeBasePart = await imageToApiPart(character.file);
          activeBasePreview = character.preview;
        } else {
          activeBasePart = null;
          activeBasePreview = "https://placehold.co/256x256/333/FFF?text=STYLE-ONLY";
        }

        additionalCharacterParts = await Promise.all(additionalCharacterFiles.map(imageToApiPart));
        additionalCharacterPreviews = await Promise.all(additionalCharacterFiles.map(fileToBase64));

        elementParts = await Promise.all(elementFiles.map(imageToApiPart));
        elementPreviews = await Promise.all(elementFiles.map(fileToBase64));
      }

      initialScene = {
        id: newSceneId,
        actionPrompt: actionPrompt,
        backgroundPrompt: backgroundPrompt,
        generatedShots: SKELETON_STATE,
        isNew: true,
        styleRefPreview: activeStylePreview,
        baseRefPreview: activeBasePreview,
        additionalCharacterPreviews: additionalCharacterPreviews,
        elementRefPreviews: elementPreviews,
        isSubjectRemoved: isSubjectRemoved,
        isOverrideMode: isOverrideMode,
        isSceneLocked: isSceneLocked,
        aspectRatio: aspectRatio
      };

      setScenes(prevScenes => [...prevScenes, initialScene]);

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
          aspectRatio
        );
        generatedShots.push(shotSrc);
      }

      setScenes(prevScenes => prevScenes.map(scene =>
        scene.id === newSceneId
          ? { ...scene, generatedShots: generatedShots }
          : scene
      ));

      setCurrentStep(STEPS.STORYBOARD);

    } catch (err) {
      console.error("Generation failed:", err);
      setError(err.message || "An unknown error occurred during generation.");
      setScenes(prevScenes => prevScenes.filter(s => s.id !== newSceneId));
    } finally {
      setIsLoading(false);
      setCurrentGeneratingText("");
    }
  }, [character, style, override]);

  const handleAddNewScene = () => {
    setCurrentStep(STEPS.SCENE);
  };

  const handleBackToStart = () => {
    setCurrentStep(STEPS.LANDING);
    setCharacter({ file: null, preview: null });
    setStyle({ file: null, preview: null });
    setOverride({ file: null, preview: null });
    setSelectedActorId("");
    setScenes([]);
    setError(null);
  };

  return (
    <>

      {currentStep === STEPS.LANDING && (
        <LandingPage onStart={() => setCurrentStep(STEPS.SETUP)} />
      )}

      {currentStep === STEPS.SETUP && (
        <SetupPage
          characterPreview={character.preview}
          onCharacterUpload={handleCharacterUpload}
          savedCharacters={savedCharacters}
          onSaveCharacter={handleSaveCharacter}
          onSelectCharacter={handleSelectCharacter}
          selectedActorId={selectedActorId}
          stylePreview={style.preview}
          onStyleUpload={handleStyleUpload}
          onNext={() => setCurrentStep(STEPS.SCENE)}
          onBack={() => setCurrentStep(STEPS.LANDING)}
        />
      )}

      {currentStep === STEPS.SCENE && (
        <Step3CreateScene
          onSubmit={handleGenerate}
          overridePreview={override.preview}
          onOverrideChange={handleOverrideChange}
          onClearOverride={handleClearOverride}
          isLoading={isLoading}
          currentGeneratingText={currentGeneratingText}
          error={error}
          characterPreview={character.preview}
          stylePreview={style.preview}
          overrideFile={override.file}
          savedCharacters={savedCharacters}
          onBack={() => setCurrentStep(STEPS.SETUP)}
        />
      )}

      {currentStep === STEPS.STORYBOARD && (
        <StoryboardView
          scenes={scenes}
          onImageClick={setViewingImage}
          onAddNewScene={handleAddNewScene}
          onBackToStart={handleBackToStart}
        />
      )}

      <Modal src={viewingImage} onClose={() => setViewingImage(null)} />
    </>
  );
}
