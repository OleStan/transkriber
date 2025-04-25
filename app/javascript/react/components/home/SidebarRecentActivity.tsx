import React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';

const SidebarRecentActivity = () => {
  // Placeholder for recent activity/history panel
  return (
    <Box sx={{ p: 2 }}>
      <Typography level="h6" sx={{ mb: 1 }}>Recent Activity</Typography>
      {/* TODO: List of recent transcriptions */}
      <Typography color="neutral">
        (Recent transcriptions will appear here)
      </Typography>
    </Box>
  );
};

export default SidebarRecentActivity;
