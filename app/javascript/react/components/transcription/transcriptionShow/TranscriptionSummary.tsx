import React, { useState, useCallback } from 'react';
import { Box, Typography, Button, IconButton, Skeleton, Collapse } from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  ContentCopy as ContentCopyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useSummarizeTranscriptionMutation } from '../../../redux/resourcesApi/transcriptions/transcriptionsSlice';

export interface SummaryData {
  overview: string;
  key_points: string[];
  action_items: string[];
}

interface TranscriptionSummaryProps {
  transcriptionId: number;
  summary: SummaryData | null;
  transcriptionText: string | null;
}

const TranscriptionSummary: React.FC<TranscriptionSummaryProps> = ({
  transcriptionId,
  summary,
  transcriptionText,
}) => {
  const [isExpanded, setIsExpanded] = useState(!!summary);
  const [isGenerating, setIsGenerating] = useState(false);
  const [localSummary, setLocalSummary] = useState<SummaryData | null>(summary);
  const [copied, setCopied] = useState(false);

  const [triggerSummarize] = useSummarizeTranscriptionMutation();

  // Sync prop changes (from WebSocket updates via parent)
  React.useEffect(() => {
    if (summary && summary !== localSummary) {
      setLocalSummary(summary);
      setIsGenerating(false);
      setIsExpanded(true);
    }
  }, [summary]);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setIsExpanded(true);
    try {
      await triggerSummarize(transcriptionId).unwrap();
      // Worker runs async; actual update comes via WebSocket → parent updates summary prop
    } catch {
      setIsGenerating(false);
    }
  }, [transcriptionId, triggerSummarize]);

  const handleCopy = useCallback(async () => {
    if (!localSummary) return;
    const md = [
      `## Overview\n${localSummary.overview}`,
      localSummary.key_points.length
        ? `## Key Points\n${localSummary.key_points.map((p) => `• ${p}`).join('\n')}`
        : '',
      localSummary.action_items.length
        ? `## Action Items\n${localSummary.action_items.map((a) => `☐ ${a}`).join('\n')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [localSummary]);

  const canGenerate = !!transcriptionText;

  return (
    <Box sx={{ px: 4, pb: 3 }}>
      <Box
        sx={{
          borderRadius: '12px',
          bgcolor: '#1a2632',
          border: '1px solid #2d4a5c',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
            cursor: 'pointer',
          }}
          onClick={() => setIsExpanded((e) => !e)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon sx={{ color: '#1993e5', fontSize: '18px' }} />
            <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '15px' }}>
              AI Summary
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {localSummary && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                title="Copy summary"
                sx={{ color: copied ? '#4caf50' : '#93b3c8' }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            )}
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleGenerate();
              }}
              disabled={!canGenerate || isGenerating}
              sx={{
                color: '#1993e5',
                textTransform: 'none',
                fontSize: '13px',
                px: 2,
                py: 0.5,
                minWidth: 'auto',
                '&:hover': { bgcolor: '#243947' },
                '&:disabled': { color: '#4a6070' },
              }}
            >
              {isGenerating ? 'Generating...' : localSummary ? 'Regenerate' : 'Generate'}
            </Button>
            {isExpanded ? (
              <ExpandLessIcon sx={{ color: '#93b3c8', fontSize: '18px' }} />
            ) : (
              <ExpandMoreIcon sx={{ color: '#93b3c8', fontSize: '18px' }} />
            )}
          </Box>
        </Box>

        {/* Body */}
        <Collapse in={isExpanded}>
          <Box sx={{ px: 3, pb: 3, borderTop: '1px solid #2d4a5c' }}>
            {isGenerating && !localSummary ? (
              /* Loading skeleton */
              <Box sx={{ pt: 2 }}>
                <Skeleton variant="text" sx={{ bgcolor: '#243947', mb: 1 }} width="60%" />
                <Skeleton
                  variant="rectangular"
                  sx={{ bgcolor: '#243947', borderRadius: 1 }}
                  height={60}
                />
                <Skeleton variant="text" sx={{ bgcolor: '#243947', mt: 2, mb: 1 }} width="40%" />
                <Skeleton variant="text" sx={{ bgcolor: '#243947' }} />
                <Skeleton variant="text" sx={{ bgcolor: '#243947' }} />
                <Skeleton variant="text" sx={{ bgcolor: '#243947' }} width="80%" />
              </Box>
            ) : localSummary ? (
              /* Summary content */
              <Box sx={{ pt: 2 }}>
                {/* Overview */}
                <Typography
                  sx={{
                    color: '#93b3c8',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    mb: 1,
                  }}
                >
                  Overview
                </Typography>
                <Typography sx={{ color: 'white', fontSize: '14px', lineHeight: 1.6, mb: 2.5 }}>
                  {localSummary.overview}
                </Typography>

                {/* Key Points */}
                {localSummary.key_points?.length > 0 && (
                  <Box sx={{ mb: 2.5 }}>
                    <Typography
                      sx={{
                        color: '#93b3c8',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        mb: 1,
                      }}
                    >
                      Key Points
                    </Typography>
                    {localSummary.key_points.map((point, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 0.75 }}>
                        <Typography
                          sx={{ color: '#1993e5', fontSize: '14px', flexShrink: 0, mt: '1px' }}
                        >
                          •
                        </Typography>
                        <Typography sx={{ color: 'white', fontSize: '14px', lineHeight: 1.5 }}>
                          {point}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Action Items */}
                {localSummary.action_items?.length > 0 && (
                  <Box>
                    <Typography
                      sx={{
                        color: '#93b3c8',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        mb: 1,
                      }}
                    >
                      Action Items
                    </Typography>
                    {localSummary.action_items.map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 0.75 }}>
                        <Typography
                          sx={{ color: '#93b3c8', fontSize: '14px', flexShrink: 0, mt: '1px' }}
                        >
                          ☐
                        </Typography>
                        <Typography sx={{ color: 'white', fontSize: '14px', lineHeight: 1.5 }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              /* Empty state */
              <Box sx={{ pt: 2, textAlign: 'center', py: 3 }}>
                <Typography sx={{ color: '#4a6070', fontSize: '14px' }}>
                  Click "Generate" to create an AI summary of this transcription.
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default TranscriptionSummary;
