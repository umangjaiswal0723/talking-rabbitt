import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import UploadZone from './components/UploadZone'
import Dashboard from './pages/Dashboard'
import ChartsPage from './pages/ChartsPage'
import ForecastPage from './pages/ForecastPage'
import ChatPage from './pages/ChatPage'
import InsightsPage from './pages/InsightsPage'
import ComparePage from './pages/ComparePage'
import SheetSelector from './components/SheetSelector'
import FileTabBar from './components/FileTabBar'
import { uploadFile, switchFile, removeFile } from './utils/api'

export default function App() {
  const [activePage, setActivePage]   = useState('dashboard')
  const [dataState, setDataState]     = useState(null)        // current active dataset
  const [dataStateB, setDataStateB]   = useState(null)        // compare slot B
  const [loadedFiles, setLoadedFiles] = useState([])          // all loaded filenames
  const [activeFile, setActiveFile]   = useState('')          // active filename
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme]             = useState('dark')

  // Upload a new file (adds as a new tab)
  const handleUpload = useCallback(async (file, slot = 'A') => {
    setLoading(true)
    setError(null)
    try {
      const res = await uploadFile(file)
      const d   = res.data
      if (slot === 'B') {
        setDataStateB(d)
      } else {
        setDataState(d)
        setLoadedFiles(d.loaded_files || [d.filename])
        setActiveFile(d.active_file  || d.filename)
        setActivePage('dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Upload failed.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Switch to a different already-loaded file
  const handleSwitchFile = useCallback(async (filename) => {
    setLoading(true)
    setError(null)
    try {
      const res = await switchFile(filename)
      const d   = res.data
      setDataState(d)
      setLoadedFiles(d.loaded_files || [d.filename])
      setActiveFile(d.active_file  || d.filename)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not switch file.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Remove a file tab
  const handleRemoveFile = useCallback(async (filename) => {
    try {
      const res = await removeFile(filename)
      const remaining = res.data.loaded_files || []
      setLoadedFiles(remaining)
      if (remaining.length === 0) {
        setDataState(null)
        setActiveFile('')
      } else {
        // Switch to the new active file
        await handleSwitchFile(res.data.active_file || remaining[0])
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not remove file.')
    }
  }, [handleSwitchFile])

  // Re-upload same Excel file with a different sheet
  const handleSheetChange = useCallback(async (file, sheetName) => {
    setLoading(true)
    setError(null)
    try {
      const res = await uploadFile(file, sheetName)
      const d   = res.data
      setDataState(d)
      setLoadedFiles(d.loaded_files || [d.filename])
      setActiveFile(d.active_file  || d.filename)
    } catch (err) {
      setError(err.response?.data?.detail || 'Sheet switch failed.')
    } finally {
      setLoading(false)
    }
  }, [])

  const hasData = !!dataState

  const renderPage = () => {
    if (!hasData && activePage !== 'chat' && activePage !== 'compare') {
      return <UploadZone onUpload={handleUpload} loading={loading} error={error} />
    }
    switch (activePage) {
      case 'dashboard': return <Dashboard data={dataState} />
      case 'charts':    return <ChartsPage data={dataState} />
      case 'forecast':  return <ForecastPage data={dataState} />
      case 'insights':  return <InsightsPage data={dataState} />
      case 'chat':      return <ChatPage hasData={hasData} filename={dataState?.filename} />
      case 'compare':   return <ComparePage dataA={dataState} dataB={dataStateB} onUploadB={f => handleUpload(f, 'B')} loading={loading} />
      default:          return <Dashboard data={dataState} />
    }
  }

  return (
    <div className={`${theme} noise flex h-screen overflow-hidden ${theme === 'light' ? 'bg-gray-50' : 'bg-ink-900'}`}>
      <div className="fixed inset-0 bg-mesh-dark pointer-events-none" />
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        hasData={hasData}
        filename={dataState?.filename}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        theme={theme}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          filename={dataState?.filename}
          onUpload={handleUpload}
          loading={loading}
          hasData={hasData}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          theme={theme}
          setTheme={setTheme}
        />

        {/* Multi-file tab bar */}
        {loadedFiles.length > 0 && (
          <FileTabBar
            loadedFiles={loadedFiles}
            activeFile={activeFile}
            onSwitch={handleSwitchFile}
            onUpload={handleUpload}
            onRemove={handleRemoveFile}
            theme={theme}
          />
        )}

        {/* Excel sheet selector */}
        {hasData && dataState?.sheets?.length > 1 && (
          <SheetSelector
            sheets={dataState.sheets}
            activeSheet={dataState.active_sheet}
            onSwitch={handleSheetChange}
            theme={theme}
          />
        )}

        <main className={`flex-1 overflow-y-auto p-4 md:p-6 relative ${theme === 'light' ? 'bg-gray-50' : ''}`}>
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
