import React, { useMemo } from "react";

import { ITranscriptionSegment } from "../redux/resourcesApi/transcriptions/types";
import useSegmentSizeStore from "../stores/useSegmentSizeStore";

// Define the type for a chunk of merged segments
interface MergedSegmentChunk {
  startOfChunk: number;
  timestampOfChunk: string;
  segments: ITranscriptionSegment[];
  id: string;
}

const useAdjustableTranscription = (segments: ITranscriptionSegment[]): MergedSegmentChunk[] => {
  const segmentSize = useSegmentSizeStore((state) => state.segmentSize);

  return useMemo(() => {
    if (!segments) return [];

    const result: MergedSegmentChunk[] = [];

    for (let i = 0; i < segments.length; i += segmentSize) {
      const chunk = segments.slice(i, i + segmentSize);
      const timestampOfChunk = chunk[0].timestamp;
      const startOfChunk = chunk[0].start;
      const id = `chunk-${i / segmentSize}`;

      result.push({ startOfChunk, timestampOfChunk, segments: chunk, id });
    }

    return result;
  }, [segments, segmentSize]);
};

export default useAdjustableTranscription;
