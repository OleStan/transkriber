import { Link as RouterLink } from 'react-router-dom';
import { Sheet, Link } from '@mui/joy';

const NavBar = () => {
  return (
    <Sheet
      sx={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: 'background.body',
        boxShadow: 'md',
      }}
    >
      <Link component={RouterLink} to='/' sx={{ textDecoration: 'none' }}>
        Home
      </Link>
      <Link component={RouterLink} to='/about' sx={{ textDecoration: 'none' }}>
        About
      </Link>
      <Link component={RouterLink} to='/contact' sx={{ textDecoration: 'none' }}>
        Contact
      </Link>
      {/* Add more links as needed */}
    </Sheet>
  );
};

export default NavBar;
