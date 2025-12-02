import { useState, useMemo } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, GridPagination } from '@mui/x-data-grid';
import { GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import Head from 'next/head';
import {
  Container,
  Typography,
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Switch,
  Autocomplete,
  TextField,
  Grid,
  Tooltip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import DirectionsIcon from '@mui/icons-material/Directions';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});


// Define a type for our data row
interface SchoolData {
  id: number;
  [key: string]: any;
}

interface SchoolNameOption {
  name: string;
  type: 'zoned' | 'unzoned';
}

interface HomeProps {
  rows: SchoolData[];
  columns: GridColDef[];
  schoolNames: SchoolNameOption[];
  boroughNames: string[];
  unzonedSchools: SchoolData[];
}

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
      light: '#818cf8',
      dark: '#5b6fd8',
    },
    secondary: {
      main: '#764ba2',
      light: '#a78bfa',
      dark: '#6b3fa0',
    },
    background: {
      default: '#f8fafc',
      paper: 'rgba(255, 255, 255, 0.9)',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(100, 116, 139, 0.12)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&.Mui-focused': {
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
            },
          },
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#818cf8',
      light: '#a78bfa',
      dark: '#6366f1',
    },
    secondary: {
      main: '#a78bfa',
      light: '#c4b5fd',
      dark: '#9333ea',
    },
    background: {
      default: '#0f172a',
      paper: 'rgba(30, 41, 59, 0.8)',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(148, 163, 184, 0.12)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(129, 140, 248, 0.3)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&.Mui-focused': {
              boxShadow: '0 4px 12px rgba(129, 140, 248, 0.2)',
            },
          },
        },
      },
    },
  },
});

export default function Home({ rows, columns: initialColumns, schoolNames, boroughNames, unzonedSchools }: HomeProps) {
  const [nameFilter, setNameFilter] = useState<SchoolNameOption[]>([]);
  const [elementaryBoroughFilter, setElementaryBoroughFilter] = useState<string[]>(['Manhattan', 'Brooklyn']);
  const [middleBoroughFilter, setMiddleBoroughFilter] = useState<string[]>(['Manhattan', 'Brooklyn']);

  const zonedNameFilter = useMemo(() => nameFilter.filter(f => f.type === 'zoned').map(f => f.name), [nameFilter]);
  const selectedUnzonedSchools = useMemo(() => {
    const unzonedNames = nameFilter.filter(f => f.type === 'unzoned').map(f => f.name);
    return unzonedSchools.filter(s => unzonedNames.includes(s['Location Name']));
  }, [nameFilter, unzonedSchools]);


  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const nameMatch =
        zonedNameFilter.length === 0 ||
        zonedNameFilter.some(filterName => row['Elementary_School'] === filterName || row['Middle_School'] === filterName);
      const elementaryBoroughMatch =
        elementaryBoroughFilter.length === 0 ||
        elementaryBoroughFilter.includes(row['Elementary_Borough']);
      const middleBoroughMatch =
        middleBoroughFilter.length === 0 ||
        middleBoroughFilter.includes(row['Middle_Borough']);
      return nameMatch && elementaryBoroughMatch && middleBoroughMatch;
    });
  }, [rows, zonedNameFilter, elementaryBoroughFilter, middleBoroughFilter]);

  function CustomPagination() {
    return <GridPagination />;
  }

  const columns: GridColDef[] = [
    {
      field: 'Elementary_School',
      headerName: 'Elementary School',
      sortable: false,
      minWidth: 150,
      flex: 1,
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params: GridRenderCellParams) => {
        const row = rows.find(r => r.id === params.id);
        if (!row) return null;

        const schoolType = row.Elementary_School_Type;
        const address = row.Elementary_Address;
        const borough = row.Elementary_Borough;
        const helpText = `Address: ${address} | Borough: ${borough} | Type: ${schoolType}`;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'flex-start' }}>
            <Typography noWrap overflow="hidden" textOverflow="ellipsis" sx={{ flexGrow: 1, flexShrink: 1 }}>
              {params.value}
            </Typography>
            <Tooltip title={helpText} disableFocusListener={false} disableTouchListener={false}>
              <IconButton size="small" sx={{ flexShrink: 0 }}>
                <InfoIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
    {
      field: 'Middle_School',
      headerName: 'Middle School',
      sortable: false,
      minWidth: 150,
      flex: 1,
      disableColumnMenu: true,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params: GridRenderCellParams) => {
        const row = rows.find(r => r.id === params.id);
        if (!row) return null;

        const schoolType = row.Middle_School_Type;
        const address = row.Middle_Address;
        const borough = row.Middle_Borough;
        const helpText = `Address: ${address} | Borough: ${borough} | Type: ${schoolType}`;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'flex-start' }}>
            <Typography noWrap overflow="hidden" textOverflow="ellipsis" sx={{ flexGrow: 1, flexShrink: 1 }}>
              {params.value}
            </Typography>
            <Tooltip title={helpText} disableFocusListener={false} disableTouchListener={false}>
              <IconButton size="small" sx={{ flexShrink: 0 }}>
                <InfoIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
    {
      field: 'Elementary_SchoolDigger_Rank',
      headerName: 'Elementary Rank',
      sortable: true,
      type: 'number',
      minWidth: 150,
      flex: 1,
      disableColumnMenu: true,
      headerAlign: 'right',
      align: 'right',
      renderHeader: (params) => (
        <Tooltip title="These are school digger ranks." disableFocusListener={false} disableTouchListener={false}>
          <Box tabIndex={0} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', cursor: 'help' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.85rem', mr: 0.5 }}>
              {params.colDef.headerName}
            </Typography>
            <IconButton size="small" sx={{ color: 'inherit', p: 0 }}>
              <InfoIcon fontSize="inherit" />
            </IconButton>
          </Box>
        </Tooltip>
      ),
      valueGetter: (value: any) => {
        if (value === 'Not Ranked' || value === '' || value === null || value === undefined) {
          return 999999;
        }
        const num = parseFloat(value);
        return isNaN(num) ? 999999 : num;
      },
      renderCell: (params: GridRenderCellParams) => {
        const rank = params.value;
        const total = params.row.Elementary_Total_Schools;
        const theme = useTheme();
        const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

        if (rank === 999999 || total === undefined || total === null) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Typography>Not Ranked</Typography>
            </Box>
          );
        }

        if (isMobile) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
              <Typography>{rank}</Typography>
              <Tooltip title={`Rank ${rank} out of ${total} schools`} disableFocusListener={false} disableTouchListener={false}>
                <IconButton size="small" sx={{ p: 0, minWidth: 'auto' }}>
                  <InfoIcon fontSize="inherit" sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </Tooltip>
            </Box>
          );
        }

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Typography>{`${rank} (out of ${total})`}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'Middle_SchoolDigger_Rank',
      headerName: 'Middle Rank',
      sortable: true,
      type: 'number',
      minWidth: 150,
      flex: 1,
      disableColumnMenu: true,
      headerAlign: 'right',
      align: 'right',
      renderHeader: (params) => (
        <Tooltip title="These are school digger ranks.">
          <Box tabIndex={0} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', cursor: 'help' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.85rem', mr: 0.5 }}>
              {params.colDef.headerName}
            </Typography>
            <IconButton size="small" sx={{ color: 'inherit', p: 0 }}>
              <InfoIcon fontSize="inherit" />
            </IconButton>
          </Box>
        </Tooltip>
      ),

      valueGetter: (value: any) => {
        if (value === 'Not Ranked' || value === '' || value === null || value === undefined) {
          return 999999;
        }
        const num = parseFloat(value);
        return isNaN(num) ? 999999 : num;
      },
      renderCell: (params: GridRenderCellParams) => {
        const rank = params.value;
        const total = params.row.Middle_Total_Schools;
        const theme = useTheme();
        const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

        if (rank === 999999 || total === undefined || total === null) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Typography>Not Ranked</Typography>
            </Box>
          );
        }

        if (isMobile) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
              <Typography>{rank}</Typography>
              <Tooltip title={`Rank ${rank} out of ${total} schools`} disableFocusListener={false} disableTouchListener={false}>
                <IconButton size="small" sx={{ p: 0, minWidth: 'auto' }}>
                  <InfoIcon fontSize="inherit" sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </Tooltip>
            </Box>
          );
        }

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Typography>{`${rank} (out of ${total})`}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'Average_Rank',
      headerName: 'Average Rank',
      sortable: true,
      type: 'number',
      minWidth: 150,
      flex: 1,
      disableColumnMenu: true,
      headerAlign: 'right',
      align: 'right',
      renderHeader: (params) => (
        <Tooltip title="This is the average of the two ranks." disableFocusListener={false} disableTouchListener={false}>
          <Box tabIndex={0} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', cursor: 'help' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.85rem', mr: 0.5 }}>
              {params.colDef.headerName}
            </Typography>
            <IconButton size="small" sx={{ color: 'inherit', p: 0 }}>
              <InfoIcon fontSize="inherit" />
            </IconButton>
          </Box>
        </Tooltip>
      ),

      valueGetter: (value: any, row: any) => {
        const elementaryRank = row.Elementary_SchoolDigger_Rank;
        const middleRank = row.Middle_SchoolDigger_Rank;

        const parsedElementaryRank = (elementaryRank === 'Not Ranked' || elementaryRank === '' || elementaryRank === null || elementaryRank === undefined)
          ? 999999
          : parseFloat(elementaryRank);

        const parsedMiddleRank = (middleRank === 'Not Ranked' || middleRank === '' || middleRank === null || middleRank === undefined)
          ? 999999
          : parseFloat(middleRank);

        if (parsedElementaryRank === 999999 && parsedMiddleRank === 999999) {
          return 999999;
        } else if (parsedElementaryRank === 999999) {
          return parsedMiddleRank;
        } else if (parsedMiddleRank === 999999) {
          return parsedElementaryRank;
        } else {
          return (parsedElementaryRank + parsedMiddleRank) / 2;
        }
      },
      renderCell: (params: GridRenderCellParams) => {
        const avgRank = params.value;
        const theme = useTheme();
        const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

        if (avgRank === 999999 || avgRank === undefined || avgRank === null) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Typography>Not Ranked</Typography>
            </Box>
          );
        }

        const displayValue = avgRank.toFixed(1);

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Typography>{displayValue}</Typography>
          </Box>
        );
      }
    },
    {
      field: 'maps_link',
      headerName: 'Map',
      sortable: false,
      minWidth: 80,
      flex: 0.5,
      disableColumnMenu: true,
      headerAlign: 'center',
      align: 'center',
      renderHeader: (params) => (
        <Tooltip title="Click the icon to view directions between the two schools on Google Maps." disableFocusListener={false} disableTouchListener={false}>
          <Box tabIndex={0} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', cursor: 'help' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.85rem', mr: 0.5 }}>
              {params.colDef.headerName}
            </Typography>
            <IconButton size="small" sx={{ color: 'inherit', p: 0 }}>
              <InfoIcon fontSize="inherit" />
            </IconButton>
          </Box>
        </Tooltip>
      ),
      renderCell: (params: GridRenderCellParams) => {
        const row = rows.find(r => r.id === params.id);
        if (!row) return null;

        const elemAddress = row.Elementary_Address;
        const middleAddress = row.Middle_Address;

        if (!elemAddress || !middleAddress) return null;

        const mapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(elemAddress)}/${encodeURIComponent(middleAddress)}`;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            <Tooltip title="View directions between schools on Google Maps" disableFocusListener={false} disableTouchListener={false}>
              <IconButton
                component="a"
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                size="small"
                sx={{
                  transform: 'translateY(-1px)', // Slight adjustment to align visually with text
                  '&:hover': { transform: 'translateY(-3px)' }
                }}
              >
                <DirectionsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    }
  ];

  const currentTheme = darkTheme; // Always use dark theme

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Head>
        <title>NYC School Overlaps</title>
        <meta
          name="description"
          content="A tool to explore overlapping elementary and middle school zones in NYC."
        />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Hero Header with Gradient */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            p: { xs: 3, md: 5 },
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
              pointerEvents: 'none',
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: 'white',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                mb: 2,
              }}
            >
              🏫 NYC School Zone Overlaps
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.95)',
                mb: 1,
                fontSize: '1.1rem',
              }}
            >
              Discover and explore overlapping elementary and middle school zones across New York City.
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontStyle: 'italic',
              }}
            >
              <strong>Disclaimer:</strong> This data is for informational purposes only. School zones can change. Always verify with official NYC DOE resources.
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontStyle: 'italic',
                mt: 1,
              }}
            >
              <strong>Note: Rankings are sourced from SchoolDigger. <a href="https://www.nycschoolfinder.com/post/districts-and-zones" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Only zoned</a> schools are included.</strong>
            </Typography>
          </Box>
        </Box>

        {/* Data Grid with Integrated Filters */}
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            borderRadius: 3,
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(148, 163, 184, 0.12)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Filters integrated at top of table */}
          <Box sx={{
            p: 2.5,
            borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
            background: 'rgba(15, 23, 42, 0.5)',
          }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={5}>
                <Autocomplete
                  multiple
                  options={schoolNames}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.name === value.name && option.type === value.type}
                  value={nameFilter}
                  onChange={(event, newValue) => setNameFilter(newValue as SchoolNameOption[])}
                  renderInput={(params) => <TextField {...params} label="Filter by School Name" size="small" />}
                  noOptionsText="School not found."
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Autocomplete
                  multiple
                  options={boroughNames}
                  value={elementaryBoroughFilter}
                  onChange={(event, newValue) => setElementaryBoroughFilter(newValue)}
                  renderInput={(params) => <TextField {...params} label="Filter by Elementary Borough" size="small" />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Autocomplete
                  multiple
                  options={boroughNames}
                  value={middleBoroughFilter}
                  onChange={(event, newValue) => setMiddleBoroughFilter(newValue)}
                  renderInput={(params) => <TextField {...params} label="Filter by Middle Borough" size="small" />}
                />
              </Grid>
            </Grid>
          </Box>
          {(zonedNameFilter.length > 0 || nameFilter.length === 0) && (
            <DataGrid
              rows={filteredRows}
              columns={columns}
              pageSizeOptions={[10, 20, 50, 100]}
              pagination={true}
              slots={{
                pagination: CustomPagination,
                noRowsOverlay: () => (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography>
                      No overlapping zoned schools found for the selected filters.
                    </Typography>
                  </Box>
                ),
              }}
              initialState={{
                sorting: {
                  sortModel: [{ field: 'Average_Rank', sort: 'asc' }],
                },
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              sx={(theme) => ({
                border: 0,
                '& .MuiDataGrid-columnHeaders': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  borderRadius: 0,
                  minHeight: '56px !important',
                  maxHeight: '56px !important',
                  lineHeight: '56px !important',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.85rem',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  fontSize: '0.9rem',
                  padding: '12px 16px',
                },
                '& .MuiDataGrid-row': {
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(129, 140, 248, 0.08)'
                      : 'rgba(102, 126, 234, 0.05)',
                    transform: 'scale(1.001)',
                  },
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: `2px solid ${theme.palette.divider}`,
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(15, 23, 42, 0.5)'
                    : 'rgba(248, 250, 252, 0.8)',
                },
                '& .MuiTablePagination-root': {
                  color: theme.palette.text.primary,
                },
                '& .MuiDataGrid-virtualScroller': {
                  '&::-webkit-scrollbar': {
                    width: '12px',
                    height: '12px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: theme.palette.background.default,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: theme.palette.primary.main,
                    borderRadius: '6px',
                    border: `3px solid ${theme.palette.background.default}`,
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: theme.palette.primary.dark,
                  },
                },
              })}
            />
          )}

          {selectedUnzonedSchools.length > 0 && selectedUnzonedSchools.map(school => (
            <Paper
              key={school.id}
              elevation={0}
              sx={{
                width: '100%',
                borderRadius: 3,
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(148, 163, 184, 0.12)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                p: 2.5,
                mt: 4,
              }}
            >
              <Typography variant="h6">{school['Location Name']}</Typography>
              <Typography sx={{ fontStyle: 'italic', color: 'primary.main', mb: 1 }}>This school is unzoned. The overlapping zones only work for <a href="https://www.nycschoolfinder.com/post/districts-and-zones" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>zoned schools</a>.</Typography>
              <Typography>{school['Full Address']}</Typography>
              <Typography>{school['Location Category Description']}</Typography>
            </Paper>
          ))}

        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const csvFilePath = path.join(process.cwd(), '..', 'Elementary_Middle_School_Overlaps_Simplified.csv');
  const csvFileContent = fs.readFileSync(csvFilePath, 'utf8');
  const parsedCsv = Papa.parse(csvFileContent, { header: true, skipEmptyLines: true });

  const unzonedCsvFilePath = path.join(process.cwd(), '..', 'unzoned_schools.csv');
  const unzonedCsvFileContent = fs.readFileSync(unzonedCsvFilePath, 'utf8');
  const unzonedParsedCsv = Papa.parse(unzonedCsvFileContent, { header: true, skipEmptyLines: true });

  const rows: SchoolData[] = parsedCsv.data.map((row: any, index) => {
    const trimmedRow: { [key: string]: any } = { id: index };
    for (const key in row) {
      if (typeof row[key] === 'string') {
        trimmedRow[key] = row[key].trim();
      } else {
        trimmedRow[key] = row[key];
      }
    }
    return trimmedRow as SchoolData;
  });

  const unzonedSchools: SchoolData[] = unzonedParsedCsv.data.map((row: any, index) => {
    const trimmedRow: { [key: string]: any } = { id: `u${index}` };
    for (const key in row) {
      if (typeof row[key] === 'string') {
        trimmedRow[key] = row[key].trim();
      } else {
        trimmedRow[key] = row[key];
      }
    }
    return trimmedRow as SchoolData;
  });

  const columns: GridColDef[] = parsedCsv.meta.fields
    ? parsedCsv.meta.fields
      .filter(field => field !== 'Overlap_Area' && field !== 'Elementary_School_Type' && field !== 'Middle_School_Type')
      .map((field) => ({
        field: field,
        headerName: field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        minWidth: 150,
        flex: 1,
      }))
    : [];

  const zonedSchoolNames = Array.from(new Set(rows.flatMap(r => [r.Elementary_School, r.Middle_School]).filter(Boolean) as string[]));
  const unzonedSchoolNames = Array.from(new Set(unzonedSchools.map(s => s['Location Name']).filter(Boolean) as string[]));

  const schoolNames: SchoolNameOption[] = [
    ...zonedSchoolNames.map(name => ({ name, type: 'zoned' as 'zoned' })),
    ...unzonedSchoolNames.map(name => ({ name, type: 'unzoned' as 'unzoned' }))
  ].sort((a, b) => a.name.localeCompare(b.name));


  const boroughNames = Array.from(new Set(rows.flatMap(r => [r.Elementary_Borough, r.Middle_Borough]).filter(Boolean) as string[])).sort();

  return {
    props: {
      rows,
      columns,
      schoolNames,
      boroughNames,
      unzonedSchools,
    },
  };
};