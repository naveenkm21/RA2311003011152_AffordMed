import {
  Stack, ToggleButton, ToggleButtonGroup, FormControl, InputLabel,
  Select, MenuItem, Button, Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const TYPES = ['All', 'Placement', 'Result', 'Event'];

export default function FilterToolbar({
  type, onType,
  limit, onLimit, limits = [10, 15, 20, 50],
  onRefresh, onMarkAllRead, busy,
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      sx={{ mb: 2 }}
    >
      <ToggleButtonGroup
        value={type}
        exclusive
        size="small"
        onChange={(_, v) => v && onType(v)}
        sx={{ flexWrap: 'wrap' }}
      >
        {TYPES.map((t) => (
          <ToggleButton key={t} value={t} sx={{ textTransform: 'none', px: 2 }}>
            {t}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Stack direction="row" spacing={1.5} alignItems="center">
        {onLimit && (
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel>Top N</InputLabel>
            <Select label="Top N" value={limit} onChange={(e) => onLimit(Number(e.target.value))}>
              {limits.map((n) => <MenuItem key={n} value={n}>{`Top ${n}`}</MenuItem>)}
            </Select>
          </FormControl>
        )}
        {onMarkAllRead && (
          <Tooltip title="Mark all as read">
            <Button
              variant="outlined"
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={onMarkAllRead}
            >
              Mark read
            </Button>
          </Tooltip>
        )}
        <Tooltip title="Refresh">
          <span>
            <Button
              variant="contained"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
              disabled={busy}
            >
              {busy ? 'Loading' : 'Refresh'}
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </Stack>
  );
}
