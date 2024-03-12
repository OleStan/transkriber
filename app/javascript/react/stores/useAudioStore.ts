import create from 'zustand';

interface AudioStoreState {
  seek: number;
  setSeek: (seek: number) => void;
}

const useAudioStore = create<AudioStoreState>((set) => ({
  seek: 0,
  setSeek: (seek) => set({ seek }),
}));

export default useAudioStore;
