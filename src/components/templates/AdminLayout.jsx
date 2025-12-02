import { Box } from '@mui/material';
import Sidebar from '../organisms/Sidebar';

const AdminLayout = ({ children }) => {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}> 
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 5, ml: '280px', overflowY: 'auto' }}>
                {children}
            </Box>
        </Box>
    );
};

export default AdminLayout;