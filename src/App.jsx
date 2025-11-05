import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';
import SetupPage from './components/SetupPage';
import Step3CreateScene from './components/Step3CreateScene';
import StoryboardView from './components/StoryboardView';
import Modal from './components/Modal';
import { fileToBase64 } from './utils/api';
import {
  getSavedCharacters,
  saveCharacter,
  uploadImage,
  callGenerateSceneAPI,
  saveGeneratedScene,
  getGeneratedScenes
} from './lib/supabase';
import { Loader2 } from 'lucide-react';

const STEPS = {
  LANDING: 'landing',
  SETUP: 'setup',
  SCENE: 'scene',
  STORYBOARD: 'storyboard'
};

export default function App() {
  const { user, loading: authLoading } = useAuth();
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

  useEffect(() => {
    if (user) {
      loadSavedCharacters();
      loadGeneratedScenes();
    }
  }, [user]);

  const loadSavedCharacters = async () => {
    try {
      const characters = await getSavedCharacters(user.id);
      setSavedCharacters(characters.map(char => ({
        id: char.id,
        name: char.name,
        preview: char.image_url,
        file: null
      })));
    } catch (err) {
      console.error('Error loading characters:', err);
    }
  };

  const loadGeneratedScenes = async () => {
    try {
      const generatedScenes = await getGeneratedScenes(user.id);
      setScenes(generatedScenes.map(scene => ({
        id: scene.id,
        imageUrl: scene.image_url,
        shotType: scene.shot_type,
        actionPrompt: scene.action_prompt
      })));
    } catch (err) {
      console.error('Error loading scenes:', err);
    }
  };

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

  const handleSaveCharacter = async (name) => {
    if (!character.file || !character.preview || !name) return;

    if (savedCharacters.some(actor => actor.name === name)) {
      setError("An actor with this name already exists.");
      return;
    }

    try {
      const imageUrl = await uploadImage(character.file, 'characters', user.id);
      const savedChar = await saveCharacter(name, imageUrl, user.id);

      const newActor = {
        id: savedChar.id,
        name: savedChar.name,
        preview: savedChar.image_url,
        file: null
      };

      setSavedCharacters(prev => [...prev, newActor]);
      setSelectedActorId(newActor.id);
      setError(null);
    } catch (err) {
      console.error('Error saving character:', err);
      setError('Failed to save character. Please try again.');
    }
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
    setCurrentGeneratingText("Analyzing your inputs...");

    try {
      const characterImage = character.preview;
      const styleImage = style.preview;
      const overrideImage = override.preview;

      const additionalCharacters = await Promise.all(
        additionalCharacterFiles.map(file => fileToBase64(file))
      );

      const elements = await Promise.all(
        elementFiles.map(file => fileToBase64(file))
      );

      setCurrentGeneratingText("Generating your scene with AI...");

      const result = await callGenerateSceneAPI({
        actionPrompt,
        backgroundPrompt,
        characterImage,
        styleImage,
        overrideImage,
        additionalCharacters,
        elements,
        isSubjectRemoved,
        isSceneLocked,
        aspectRatio
      });

      const sceneData = {
        imageUrl: result.imageGenerationPrompt,
        shotType: result.shotType || 'Generated Scene',
        actionPrompt,
        backgroundPrompt,
        aspectRatio,
        isSubjectRemoved,
        isSceneLocked
      };

      const savedScene = await saveGeneratedScene(sceneData, user.id);

      const newScene = {
        id: savedScene.id,
        imageUrl: savedScene.image_url,
        shotType: savedScene.shot_type,
        actionPrompt: savedScene.action_prompt,
        imageDescription: result.imageDescription
      };

      setScenes(prev => [...prev, newScene]);
      setCurrentStep(STEPS.STORYBOARD);

    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || "Failed to generate scene. Please try again.");
    } finally {
      setIsLoading(false);
      setCurrentGeneratingText("");
    }
  }, [character.preview, style.preview, override.preview, user]);

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#10B981] animate-spin" />
          <p className="text-contrast/70 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

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
