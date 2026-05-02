import { AppBar, Toolbar, Typography, Box, Button, Container, Chip } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ unreadCount = 0, children }) {
  const loc = useLocation();
  const tabSx = (active) => ({
    color: 'white',
    fontWeight: 600,
    borderBottom: active ? '2px solid #fff' : '2px solid transparent',
    borderRadius: 0,
    px: { xs: 1.25, sm: 2 },
  });

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'primary.main' }}>
        <Toolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
          <NotificationsActiveIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexShrink: 0, mr: { sm: 3 } }}>
            Campus Notifications
          </Typography>
          <Box sx={{ flexGrow: 1, display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
            <Button component={Link} to="/" sx={tabSx(loc.pathname === '/')}>
              All
            </Button>
            <Button component={Link} to="/priority" sx={tabSx(loc.pathname === '/priority')}>
              Priority
            </Button>
          </Box>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} new`}
              color="secondary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 }, flexGrow: 1 }}>
        {children}
      </Container>
      <Box component="footer" sx={{ textAlign: 'center', py: 2, color: 'text.secondary', fontSize: 13 }}>
        AffordMed Campus Platform · Stage 2
      </Box>
    </Box>
  );
}
