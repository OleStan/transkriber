import React, { useState, useCallback } from 'react';
import { Box, Typography, Button, IconButton, Skeleton, Collapse } from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  ContentCopy as ContentCopyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircleOutline as CheckCircleIcon,
} from '@mui/icons-material';
import { useSummarizeTranscriptionMutation } from '../../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import { DS } from '../../../theme';

export interface SummaryData {
  overview: string;
  keyPoints: string[];
  actionItems: string[];
}

interface TranscriptionSummaryProps {
  transcriptionId: number;
  summary: SummaryData | null;
  transcriptionText: string | null;
  onGenerateStart?: () => void;
}

const TranscriptionSummary: React.FC<TranscriptionSummaryProps> = ({
  transcriptionId,
  summary,
  transcriptionText,
  onGenerateStart,
}) => {
  const [isExpanded, setIsExpanded] = useState(!!summary);
  const [isGenerating, setIsGenerating] = useState(false);
  const [localSummary, setLocalSummary] = useState<SummaryData | null>(summary);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [triggerSummarize] = useSummarizeTranscriptionMutation();

  React.useEffect(() => {
    if (summary && summary !== localSummary) {
      setLocalSummary(summary);
      setIsGenerating(false);
      setIsExpanded(true);
    }
  }, [summary]);

  const handleGenerate = useCallback(async () => {
    setError(null);
    setIsGenerating(true);
    setIsExpanded(true);
    onGenerateStart?.();
    try {
      await triggerSummarize(transcriptionId).unwrap();
    } catch {
      setError('Failed to generate summary. Please try again.');
      setIsGenerating(false);
    }
  }, [transcriptionId, triggerSummarize, onGenerateStart]);

  const handleCopy = useCallback(async () => {
    if (!localSummary) return;
    const md = [
      `## Overview\n${localSummary.overview}`,
      localSummary.keyPoints.length
        ? `## Key Points\n${localSummary.keyPoints.map((p) => `• ${p}`).join('\n')}`
        : '',
      localSummary.actionItems.length
        ? `## Action Items\n${localSummary.actionItems.map((a) => `☐ ${a}`).join('\n')}`
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
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          borderRadius: '16px',
          bgcolor: DS.tertiaryContainer,
          border: `1px solid ${DS.outlineVariant}1a`,
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: 'rgba(202, 128, 30, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AutoAwesomeIcon sx={{ color: DS.tertiary, fontSize: '18px' }} />
            </Box>
            <Typography sx={{ color: DS.onSurface, fontFamily: '"Manrope", sans-serif', fontWeight: 700, fontSize: '15px' }}>
              AI Intel Summary
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {localSummary && (
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                title="Copy summary"
                sx={{ color: copied ? '#34d399' : DS.outline, '&:hover': { bgcolor: 'transparent' } }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            )}
            <Button
              size="small"
              onClick={(e) => { e.stopPropagation(); handleGenerate(); }}
              disabled={!canGenerate || isGenerating}
              sx={{
                color: DS.tertiary,
                fontFamily: '"Inter", sans-serif',
                textTransform: 'none',
                fontSize: '13px',
                fontWeight: 600,
                px: 2,
                py: 0.5,
                minWidth: 'auto',
                borderRadius: '8px',
                '&:hover': { bgcolor: 'rgba(255, 184, 105, 0.1)' },
                '&:disabled': { color: `${DS.tertiary}60` },
              }}
            >
              {isGenerating ? 'Generating...' : localSummary ? 'Regenerate' : 'Generate'}
            </Button>
            {isExpanded ? (
              <ExpandLessIcon sx={{ color: DS.outline, fontSize: '18px' }} />
            ) : (
              <ExpandMoreIcon sx={{ color: DS.outline, fontSize: '18px' }} />
            )}
          </Box>
        </Box>

        {/* Body */}
        <Collapse in={isExpanded}>
          <Box sx={{ px: 3, pb: 3, borderTop: `1px solid ${DS.outlineVariant}20` }}>
            {isGenerating && !localSummary ? (
              <Box sx={{ pt: 2 }}>
                <Skeleton variant="text" sx={{ bgcolor: `${DS.outlineVariant}30`, mb: 1 }} width="60%" />
                <Skeleton variant="rectangular" sx={{ bgcolor: `${DS.outlineVariant}30`, borderRadius: 1 }} height={60} />
                <Skeleton variant="text" sx={{ bgcolor: `${DS.outlineVariant}30`, mt: 2, mb: 1 }} width="40%" />
                <Skeleton variant="text" sx={{ bgcolor: `${DS.outlineVariant}30` }} />
                <Skeleton variant="text" sx={{ bgcolor: `${DS.outlineVariant}30` }} />
                <Skeleton variant="text" sx={{ bgcolor: `${DS.outlineVariant}30` }} width="80%" />
              </Box>
            ) : localSummary ? (
              <Box
                sx={{
                  pt: 2,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 3,
                }}
              >
                {/* Left: Executive Overview */}
                <Box>
                  <Typography
                    sx={{
                      color: DS.outline,
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      fontFamily: '"Inter", sans-serif',
                      mb: 1.5,
                    }}
                  >
                    Executive Overview
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Newsreader", serif',
                      fontSize: '1rem',
                      lineHeight: 1.7,
                      color: DS.onSurface,
                      fontStyle: 'italic',
                    }}
                  >
                    {localSummary.overview}
                  </Typography>

                  {localSummary.keyPoints?.length > 0 && (
                    <Box sx={{ mt: 2.5 }}>
                      <Typography
                        sx={{
                          color: DS.outline,
                          fontSize: '10px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.15em',
                          fontFamily: '"Inter", sans-serif',
                          mb: 1.5,
                        }}
                      >
                        Key Points
                      </Typography>
                      {localSummary.keyPoints.map((point, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
                          <Typography sx={{ color: DS.primary, fontSize: '14px', flexShrink: 0, mt: '2px', fontFamily: '"Inter", sans-serif' }}>•</Typography>
                          <Typography sx={{ color: DS.onSurface, fontFamily: '"Inter", sans-serif', fontSize: '14px', lineHeight: 1.5 }}>
                            {point}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Right: Action Items */}
                {localSummary.actionItems?.length > 0 && (
                  <Box>
                    <Typography
                      sx={{
                        color: DS.outline,
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        fontFamily: '"Inter", sans-serif',
                        mb: 1.5,
                      }}
                    >
                      Action Items
                    </Typography>
                    {localSummary.actionItems.map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                        <CheckCircleIcon sx={{ color: DS.primary, fontSize: '18px', flexShrink: 0, mt: '1px' }} />
                        <Typography sx={{ color: DS.onSurface, fontFamily: '"Inter", sans-serif', fontSize: '14px', lineHeight: 1.5 }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ pt: 2, textAlign: 'center', py: 3 }}>
                {error && (
                  <Typography sx={{ color: DS.error, fontFamily: '"Inter", sans-serif', fontSize: '13px', mb: 1 }}>
                    {error}
                  </Typography>
                )}
                <Typography sx={{ color: DS.onSurfaceVariant, fontFamily: '"Newsreader", serif', fontSize: '1rem', fontStyle: 'italic' }}>
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
