import { Card, CardContent, Stack, Typography, Chip, Box } from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const TYPE_META = {
  Placement: { color: '#1f5fa8', icon: <WorkOutlineIcon fontSize="small" /> },
  Result:    { color: '#7a4dab', icon: <AssessmentIcon fontSize="small" /> },
  Event:     { color: '#2e7d54', icon: <EventAvailableIcon fontSize="small" /> },
};

function formatTimestamp(t) {
  if (!t) return '';
  try {
    const d = new Date(String(t).replace(' ', 'T') + 'Z');
    if (isNaN(d.getTime())) return t;
    return d.toLocaleString();
  } catch {
    return t;
  }
}

export default function NotificationCard({ notification, isNew, rank, onView }) {
  const meta = TYPE_META[notification.Type] || { color: '#555', icon: null };
  const handleEnter = () => onView?.(notification.ID);

  return (
    <Card
      onMouseEnter={handleEnter}
      onClick={handleEnter}
      sx={{
        position: 'relative',
        cursor: 'pointer',
        borderLeft: `4px solid ${meta.color}`,
        bgcolor: isNew ? '#fff8e7' : 'background.paper',
        transition: 'transform .15s, box-shadow .15s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
      }}
    >
      <CardContent sx={{ pb: '16px !important' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
          {rank && (
            <Chip
              label={`#${rank}`}
              size="small"
              sx={{ bgcolor: meta.color, color: 'white', fontWeight: 700 }}
            />
          )}
          <Chip
            icon={meta.icon}
            label={notification.Type}
            size="small"
            variant="outlined"
            sx={{ borderColor: meta.color, color: meta.color, fontWeight: 600 }}
          />
          {isNew && (
            <Chip
              icon={<FiberManualRecordIcon sx={{ fontSize: 10 }} />}
              label="NEW"
              size="small"
              color="secondary"
              sx={{ fontWeight: 700 }}
            />
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" color="text.secondary">
            {formatTimestamp(notification.Timestamp)}
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{ fontWeight: isNew ? 600 : 500, wordBreak: 'break-word' }}>
          {notification.Message}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
          ID: {notification.ID}
        </Typography>
      </CardContent>
    </Card>
  );
}
