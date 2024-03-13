import create from 'zustand';

interface SegmentSizeStoreState {
  segmentSize: number;
  setSegmentSize: (segmentSize: number) => void;
}

const useSegmentSizeStore = create<SegmentSizeStoreState>((set, get) => ({
  segmentSize: parseInt(localStorage.getItem('segmentSize') || '5', 10),

  setSegmentSize: (segmentSize: number) => {
    set({ segmentSize });

    localStorage.setItem('segmentSize', segmentSize.toString());
  },
}));

export default useSegmentSizeStore;
